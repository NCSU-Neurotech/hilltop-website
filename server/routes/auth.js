const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const { PrismaClient } = require('@prisma/client')
const { requireAuth, JWT_SECRET } = require('../middleware/auth')
const { logAction } = require('../utils/auditLog')

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

module.exports = router
