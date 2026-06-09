const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/progress/:childId — all book progress for a child
router.get('/:childId', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.childId, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })

  const progress = await prisma.bookProgress.findMany({ where: { childId: req.params.childId } })
  res.json(progress)
})

// PUT /api/progress/:childId/:bookId — upsert book progress
router.put('/:childId/:bookId', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.childId, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })

  const { pageIndex } = req.body
  const record = await prisma.bookProgress.upsert({
    where: { childId_bookId: { childId: req.params.childId, bookId: req.params.bookId } },
    update: { pageIndex },
    create: { childId: req.params.childId, bookId: req.params.bookId, pageIndex },
  })
  res.json(record)
})

module.exports = router
