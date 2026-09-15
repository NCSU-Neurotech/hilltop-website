const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { logAction } = require('../utils/auditLog')

const router = express.Router()
const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/soundboards
// List all sound boards for facility (with audio data)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const soundBoards = await prisma.soundBoard.findMany({
      where: { facilityId: req.user.facilityId },
      orderBy: { order: 'asc' },
    })

    // Parse JSON sounds field
    const formatted = soundBoards.map((sb) => ({
      ...sb,
      sounds: sb.sounds ? JSON.parse(sb.sounds) : [],
    }))

    res.json(formatted)
  } catch (err) {
    console.error('Fetch sound boards error:', err)
    res.status(500).json({ error: 'Failed to fetch sound boards' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/soundboards/:id
// Get single sound board with child progress
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { childId } = req.query

    const soundBoard = await prisma.soundBoard.findUnique({
      where: { id },
    })

    if (!soundBoard || soundBoard.facilityId !== req.user.facilityId) {
      return res.status(404).json({ error: 'Sound board not found' })
    }

    const response = {
      ...soundBoard,
      sounds: soundBoard.sounds ? JSON.parse(soundBoard.sounds) : [],
    }

    // Add progress if childId provided
    if (childId) {
      const progress = await prisma.soundBoardProgress.findUnique({
        where: {
          childId_soundBoardId: {
            childId,
            soundBoardId: id,
          },
        },
      })

      response.progress = progress
        ? {
            favorites: progress.favorites ? JSON.parse(progress.favorites) : [],
            lastPlayedAt: progress.lastPlayedAt,
            playCount: progress.playCount,
          }
        : { favorites: [], lastPlayedAt: null, playCount: 0 }
    }

    res.json(response)
  } catch (err) {
    console.error('Fetch sound board error:', err)
    res.status(500).json({ error: 'Failed to fetch sound board' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/soundboards
// Create new sound board (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, emoji, description, color, sounds = [] } = req.body

    if (!name || !emoji) {
      return res.status(400).json({ error: 'Name and emoji required' })
    }

    const soundBoard = await prisma.soundBoard.create({
      data: {
        facilityId: req.user.facilityId,
        name,
        emoji,
        description,
        color: color || '#a855f7',
        sounds: JSON.stringify(sounds),
        isPreset: false,
      },
    })

    await logAction(
      req.user.facilityId,
      'create_soundboard',
      'SoundBoard',
      soundBoard.id,
      { name, emoji }
    )

    res.status(201).json({
      ...soundBoard,
      sounds: sounds,
    })
  } catch (err) {
    console.error('Create sound board error:', err)
    res.status(500).json({ error: 'Failed to create sound board' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/soundboards/:id
// Update sound board (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, emoji, description, color, sounds } = req.body

    const soundBoard = await prisma.soundBoard.findUnique({
      where: { id },
    })

    if (!soundBoard || soundBoard.facilityId !== req.user.facilityId) {
      return res.status(404).json({ error: 'Sound board not found' })
    }

    if (soundBoard.isPreset) {
      return res.status(403).json({ error: 'Cannot edit preset sound boards' })
    }

    const updates = {}
    if (name) updates.name = name
    if (emoji) updates.emoji = emoji
    if (description) updates.description = description
    if (color) updates.color = color
    if (sounds) updates.sounds = JSON.stringify(sounds)

    const updated = await prisma.soundBoard.update({
      where: { id },
      data: updates,
    })

    await logAction(
      req.user.facilityId,
      'update_soundboard',
      'SoundBoard',
      id,
      updates
    )

    res.json({
      ...updated,
      sounds: updated.sounds ? JSON.parse(updated.sounds) : [],
    })
  } catch (err) {
    console.error('Update sound board error:', err)
    res.status(500).json({ error: 'Failed to update sound board' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/soundboards/:id
// Delete sound board (admin only, custom boards only)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    const soundBoard = await prisma.soundBoard.findUnique({
      where: { id },
    })

    if (!soundBoard || soundBoard.facilityId !== req.user.facilityId) {
      return res.status(404).json({ error: 'Sound board not found' })
    }

    if (soundBoard.isPreset) {
      return res.status(403).json({ error: 'Cannot delete preset sound boards' })
    }

    await prisma.soundBoard.delete({
      where: { id },
    })

    await logAction(req.user.facilityId, 'delete_soundboard', 'SoundBoard', id)

    res.json({ ok: true })
  } catch (err) {
    console.error('Delete sound board error:', err)
    res.status(500).json({ error: 'Failed to delete sound board' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/soundboards/:id/play
// Log sound play event (for analytics/tracking)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/play', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { childId, soundId } = req.body

    if (!childId) {
      return res.status(400).json({ error: 'childId required' })
    }

    // Verify sound board exists and belongs to facility
    const soundBoard = await prisma.soundBoard.findUnique({
      where: { id },
    })

    if (!soundBoard || soundBoard.facilityId !== req.user.facilityId) {
      return res.status(404).json({ error: 'Sound board not found' })
    }

    // Update or create progress
    const progress = await prisma.soundBoardProgress.upsert({
      where: {
        childId_soundBoardId: {
          childId,
          soundBoardId: id,
        },
      },
      create: {
        childId,
        soundBoardId: id,
        playCount: 1,
      },
      update: {
        playCount: { increment: 1 },
        lastPlayedAt: new Date(),
      },
    })

    res.json({ ok: true, playCount: progress.playCount })
  } catch (err) {
    console.error('Play sound error:', err)
    res.status(500).json({ error: 'Failed to log play event' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/soundboards/:id/progress/:childId
// Get child's progress on a sound board
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/progress/:childId', requireAuth, async (req, res) => {
  try {
    const { id, childId } = req.params

    // Verify sound board belongs to facility
    const soundBoard = await prisma.soundBoard.findUnique({
      where: { id },
    })

    if (!soundBoard || soundBoard.facilityId !== req.user.facilityId) {
      return res.status(404).json({ error: 'Sound board not found' })
    }

    const progress = await prisma.soundBoardProgress.findUnique({
      where: {
        childId_soundBoardId: {
          childId,
          soundBoardId: id,
        },
      },
    })

    if (!progress) {
      return res.json({ favorites: [], lastPlayedAt: null, playCount: 0 })
    }

    res.json({
      favorites: progress.favorites ? JSON.parse(progress.favorites) : [],
      lastPlayedAt: progress.lastPlayedAt,
      playCount: progress.playCount,
    })
  } catch (err) {
    console.error('Fetch progress error:', err)
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/soundboards/:id/favorites/:childId
// Update child's favorite sounds in a board
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/favorites/:childId', requireAuth, async (req, res) => {
  try {
    const { id, childId } = req.params
    const { favorites = [] } = req.body // Array of sound IDs

    // Verify sound board belongs to facility
    const soundBoard = await prisma.soundBoard.findUnique({
      where: { id },
    })

    if (!soundBoard || soundBoard.facilityId !== req.user.facilityId) {
      return res.status(404).json({ error: 'Sound board not found' })
    }

    const progress = await prisma.soundBoardProgress.upsert({
      where: {
        childId_soundBoardId: {
          childId,
          soundBoardId: id,
        },
      },
      create: {
        childId,
        soundBoardId: id,
        favorites: JSON.stringify(favorites),
      },
      update: {
        favorites: JSON.stringify(favorites),
      },
    })

    res.json({
      favorites: favorites,
      lastPlayedAt: progress.lastPlayedAt,
      playCount: progress.playCount,
    })
  } catch (err) {
    console.error('Update favorites error:', err)
    res.status(500).json({ error: 'Failed to update favorites' })
  }
})

module.exports = router
