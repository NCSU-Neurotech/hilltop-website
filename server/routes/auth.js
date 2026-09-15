const express = require('express')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, JWT_SECRET } = require('../middleware/auth')
const { logAction } = require('../utils/auditLog')
const { sendMail } = require('../utils/mailer')

const router = express.Router()
const prisma = new PrismaClient()

// Client (Vercel) and server (Railway) are deployed on different domains in
// production — that's a genuinely cross-site request from the browser's
// point of view, and cross-site cookies require SameSite=None + Secure (the
// pairing is mandatory: browsers reject SameSite=None cookies that aren't
// also Secure). Locally, client and server share the "localhost" domain
// (only the port differs, which SameSite ignores), so 'lax' over plain HTTP
// keeps working for local dev without needing HTTPS.
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// One shared password per facility is a single high-value credential with
// no other protection (no lockout, no MFA) — rate limit attempts per IP so
// it can't be brute-forced.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
})

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many signup attempts. Please try again later.' },
})

const resetRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reset requests. Please try again later.' },
})

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000 // 30 minutes

function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex')
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// Create a new facility with its one shared login. Not exposed via a public
// self-serve form (see client/src/pages/Signup.jsx) — facilities are
// provisioned out-of-band; this endpoint is what provisioning calls.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { facilityName, email, password } = req.body

    if (!facilityName || !email || !password) {
      return res.status(400).json({ error: 'All fields required' })
    }

    const existing = await prisma.facility.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const facility = await prisma.facility.create({
      data: {
        name: facilityName,
        email,
        password: hashedPassword,
        status: 'active',
      },
    })

    await logAction(facility.id, 'signup', 'Facility', facility.id)

    const token = jwt.sign({ facilityId: facility.id }, JWT_SECRET)

    res.cookie('token', token, COOKIE_OPTS).json({
      facility: { id: facility.id, name: facility.name, email: facility.email },
    })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Facility login with its one shared email + password.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const facility = await prisma.facility.findUnique({ where: { email } })
    if (!facility) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, facility.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (facility.status !== 'active') {
      return res.status(403).json({ error: 'This facility is not active' })
    }

    await logAction(facility.id, 'login', null, null)

    const token = jwt.sign({ facilityId: facility.id }, JWT_SECRET)

    res.cookie('token', token, COOKIE_OPTS).json({
      facility: { id: facility.id, name: facility.name, email: facility.email },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  // clearCookie must be called with the same sameSite/secure attributes the
  // cookie was set with, or some browsers treat it as a different cookie
  // and leave the original one in place — logout would look like it worked
  // but the session cookie would still be valid.
  res.clearCookie('token', { httpOnly: true, secure: IS_PRODUCTION, sameSite: IS_PRODUCTION ? 'none' : 'lax' }).json({ ok: true })
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// Get the current session's facility.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: req.user.facilityId },
      select: { id: true, name: true, email: true },
    })

    if (!facility) {
      return res.status(401).json({ error: 'Facility not found' })
    }

    res.json({ facility })
  } catch (err) {
    console.error('Auth me error:', err)
    res.status(500).json({ error: 'Failed to fetch facility info' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Always responds the same way regardless of whether the email matches a
// facility, so this endpoint can't be used to discover which emails have
// accounts.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', resetRequestLimiter, async (req, res) => {
  const GENERIC_RESPONSE = { ok: true, message: 'If that email has an account, a reset link has been sent.' }

  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const facility = await prisma.facility.findUnique({ where: { email } })
    if (!facility) return res.json(GENERIC_RESPONSE)

    const rawToken = crypto.randomBytes(32).toString('hex')
    await prisma.facility.update({
      where: { id: facility.id },
      data: {
        resetTokenHash: hashResetToken(rawToken),
        resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    })

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`
    await sendMail({
      to: facility.email,
      subject: 'Reset your AssistiveGames password',
      text: `Reset your facility's password here: ${resetUrl}\n\nThis link expires in 30 minutes. If you didn't request this, ignore this email.`,
      html: `<p>Reset your facility's password by clicking the link below.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes. If you didn't request this, ignore this email.</p>`,
    })

    res.json(GENERIC_RESPONSE)
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Failed to process request' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password required' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    const facility = await prisma.facility.findFirst({
      where: { resetTokenHash: hashResetToken(token) },
    })

    if (!facility || !facility.resetTokenExpiresAt || facility.resetTokenExpiresAt < new Date()) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.facility.update({
      where: { id: facility.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    })

    await logAction(facility.id, 'reset_password', 'Facility', facility.id)

    res.json({ ok: true })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Failed to reset password' })
  }
})

module.exports = router
