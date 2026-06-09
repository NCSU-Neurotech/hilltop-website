const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/children — list all children for this facility
router.get('/', requireAuth, async (req, res) => {
  const children = await prisma.child.findMany({
    where: { facilityId: req.facilityId },
    orderBy: { createdAt: 'asc' },
  })
  res.json(children)
})

// POST /api/children — create a child
router.post('/', requireAuth, async (req, res) => {
  const { firstName, age, avatarId, scanSpeedMs, scanHighlightColor, voiceRate, voicePitch, preferredCategories, notes } = req.body
  if (!firstName || age == null) return res.status(400).json({ error: 'firstName and age required' })

  const child = await prisma.child.create({
    data: {
      facilityId: req.facilityId,
      firstName,
      age,
      avatarId: avatarId || 'bear',
      scanSpeedMs: scanSpeedMs || 1200,
      scanHighlightColor: scanHighlightColor || '#FFD700',
      voiceRate: voiceRate || 0.85,
      voicePitch: voicePitch || 1.0,
      preferredCategories: preferredCategories || [],
      notes: notes || '',
    },
  })
  res.status(201).json(child)
})

// GET /api/children/:id — single child (must belong to this facility)
router.get('/:id', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.id, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })
  res.json(child)
})

// PATCH /api/children/:id — update a child
router.patch('/:id', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.id, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })

  const updated = await prisma.child.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(updated)
})

// DELETE /api/children/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.id, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })

  await prisma.child.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

module.exports = router
