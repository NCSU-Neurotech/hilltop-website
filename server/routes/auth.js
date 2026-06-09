const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { JWT_SECRET } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields required' })

  const exists = await prisma.facility.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ error: 'Email already registered' })

  const hashed = await bcrypt.hash(password, 12)
  const facility = await prisma.facility.create({
    data: { name, email, password: hashed },
  })

  const token = jwt.sign({ facilityId: facility.id }, JWT_SECRET)
  res.cookie('token', token, COOKIE_OPTS).json({ id: facility.id, name: facility.name, email: facility.email })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const facility = await prisma.facility.findUnique({ where: { email } })
  if (!facility) return res.status(401).json({ error: 'Invalid credentials' })

  const match = await bcrypt.compare(password, facility.password)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ facilityId: facility.id }, JWT_SECRET)
  res.cookie('token', token, COOKIE_OPTS).json({ id: facility.id, name: facility.name, email: facility.email })
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('token').json({ ok: true })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const { facilityId } = jwt.verify(token, JWT_SECRET)
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
      select: { id: true, name: true, email: true },
    })
    if (!facility) return res.status(401).json({ error: 'Facility not found' })
    res.json(facility)
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

module.exports = router
