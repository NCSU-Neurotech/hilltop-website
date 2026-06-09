const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/comm-board/:childId — all tiles for a child
router.get('/:childId', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.childId, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })

  const tiles = await prisma.commTile.findMany({
    where: { childId: req.params.childId },
    orderBy: [{ boardId: 'asc' }, { order: 'asc' }],
  })
  res.json(tiles)
})

// POST /api/comm-board/:childId — add a tile
router.post('/:childId', requireAuth, async (req, res) => {
  const child = await prisma.child.findFirst({ where: { id: req.params.childId, facilityId: req.facilityId } })
  if (!child) return res.status(404).json({ error: 'Child not found' })

  const { label, icon, boardId, order } = req.body
  const tile = await prisma.commTile.create({
    data: { childId: req.params.childId, label, icon, boardId, order },
  })
  res.status(201).json(tile)
})

// PATCH /api/comm-board/tile/:tileId — update a tile
router.patch('/tile/:tileId', requireAuth, async (req, res) => {
  const tile = await prisma.commTile.findUnique({ where: { id: req.params.tileId }, include: { child: true } })
  if (!tile || tile.child.facilityId !== req.facilityId) return res.status(404).json({ error: 'Tile not found' })

  const updated = await prisma.commTile.update({ where: { id: req.params.tileId }, data: req.body })
  res.json(updated)
})

// DELETE /api/comm-board/tile/:tileId
router.delete('/tile/:tileId', requireAuth, async (req, res) => {
  const tile = await prisma.commTile.findUnique({ where: { id: req.params.tileId }, include: { child: true } })
  if (!tile || tile.child.facilityId !== req.facilityId) return res.status(404).json({ error: 'Tile not found' })

  await prisma.commTile.delete({ where: { id: req.params.tileId } })
  res.json({ ok: true })
})

module.exports = router
