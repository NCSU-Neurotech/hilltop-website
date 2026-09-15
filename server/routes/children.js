const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { logAction } = require('../utils/auditLog')

const router = express.Router()
const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/children
// List all children for this facility
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      where: { facilityId: req.user.facilityId },
      include: {
        ttsPreference: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    res.json(children)
  } catch (err) {
    console.error('Fetch children error:', err)
    res.status(500).json({ error: 'Failed to fetch children' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/children
// Create a child
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      firstName,
      age,
      avatarId,
      scanSpeedMs,
      scanHighlightColor,
      voiceRate,
      voicePitch,
      enabledCategories,
      enabledLearnTiers,
    } = req.body

    if (!firstName || age == null) {
      return res.status(400).json({ error: 'firstName and age required' })
    }

    const child = await prisma.child.create({
      data: {
        facilityId: req.user.facilityId,
        firstName,
        age,
        avatarId: avatarId || 'bear',
        scanSpeedMs: scanSpeedMs || 1200,
        scanHighlightColor: scanHighlightColor || '#FFD700',
        voiceRate: voiceRate || 0.85,
        voicePitch: voicePitch || 1.0,
        enabledCategories: enabledCategories || ['games', 'learn', 'stories', 'sound-boards', 'communicate'],
        enabledLearnTiers: enabledLearnTiers || ['beginner', 'intermediate', 'advanced'],
      },
    })

    await logAction(req.user.facilityId, 'create_child', 'Child', child.id, {
      firstName,
      age,
    })

    res.status(201).json(child)
  } catch (err) {
    console.error('Create child error:', err)
    res.status(500).json({ error: 'Failed to create child' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/children/:id
// Get single child with all related data
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const child = await prisma.child.findFirst({
      where: {
        id: req.params.id,
        facilityId: req.user.facilityId,
      },
      include: {
        ttsPreference: true,
        caregiverNotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    res.json(child)
  } catch (err) {
    console.error('Fetch child error:', err)
    res.status(500).json({ error: 'Failed to fetch child' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/children/:id
// Update child profile (scan settings, accessibility, etc.)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const child = await prisma.child.findFirst({
      where: {
        id: req.params.id,
        facilityId: req.user.facilityId,
      },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    // Whitelist updatable fields
    const allowedFields = [
      'firstName',
      'age',
      'avatarId',
      'scanSpeedMs',
      'scanHighlightColor',
      'voiceRate',
      'voicePitch',
      'fontSizeRem',
      'highContrastMode',
      'darkModeOverride',
      'enabledCategories',
      'enabledLearnTiers',
    ]

    const updates = {}
    allowedFields.forEach((field) => {
      if (field in req.body) {
        updates[field] = req.body[field]
      }
    })

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    const updated = await prisma.child.update({
      where: { id: req.params.id },
      data: updates,
    })

    await logAction(req.user.facilityId, 'update_child', 'Child', req.params.id, updates)

    res.json(updated)
  } catch (err) {
    console.error('Update child error:', err)
    res.status(500).json({ error: 'Failed to update child' })
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/children/:id
// Delete a child
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const child = await prisma.child.findFirst({
      where: {
        id: req.params.id,
        facilityId: req.user.facilityId,
      },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    await prisma.child.delete({
      where: { id: req.params.id },
    })

    await logAction(req.user.facilityId, 'delete_child', 'Child', req.params.id)

    res.json({ ok: true })
  } catch (err) {
    console.error('Delete child error:', err)
    res.status(500).json({ error: 'Failed to delete child' })
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// CAREGIVER NOTES
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/children/:childId/caregiver-notes
router.get('/:childId/caregiver-notes', requireAuth, async (req, res) => {
  try {
    const child = await prisma.child.findFirst({
      where: { id: req.params.childId, facilityId: req.user.facilityId },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    const notes = await prisma.caregiverNote.findMany({
      where: { childId: req.params.childId },
      orderBy: { createdAt: 'desc' },
    })

    res.json(notes)
  } catch (err) {
    console.error('Fetch caregiver notes error:', err)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
})

// POST /api/children/:childId/caregiver-notes
router.post('/:childId/caregiver-notes', requireAuth, async (req, res) => {
  try {
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content required' })
    }

    const child = await prisma.child.findFirst({
      where: { id: req.params.childId, facilityId: req.user.facilityId },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    const note = await prisma.caregiverNote.create({
      data: {
        childId: req.params.childId,
        content: content.trim(),
      },
    })

    await logAction(
      req.user.facilityId,
      'create_caregiver_note',
      'CaregiverNote',
      note.id
    )

    res.status(201).json(note)
  } catch (err) {
    console.error('Create caregiver note error:', err)
    res.status(500).json({ error: 'Failed to create note' })
  }
})

// PATCH /api/children/:childId/caregiver-notes/:noteId
router.patch('/:childId/caregiver-notes/:noteId', requireAuth, async (req, res) => {
  try {
    const { isPinned } = req.body

    const note = await prisma.caregiverNote.findFirst({
      where: {
        id: req.params.noteId,
        child: { facilityId: req.user.facilityId },
      },
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    const updated = await prisma.caregiverNote.update({
      where: { id: req.params.noteId },
      data: { isPinned: typeof isPinned === 'boolean' ? isPinned : note.isPinned },
    })

    res.json(updated)
  } catch (err) {
    console.error('Update caregiver note error:', err)
    res.status(500).json({ error: 'Failed to update note' })
  }
})

// DELETE /api/children/:childId/caregiver-notes/:noteId
router.delete('/:childId/caregiver-notes/:noteId', requireAuth, async (req, res) => {
  try {
    const note = await prisma.caregiverNote.findFirst({
      where: {
        id: req.params.noteId,
        child: { facilityId: req.user.facilityId },
      },
    })

    if (!note) {
      return res.status(404).json({ error: 'Note not found' })
    }

    await prisma.caregiverNote.delete({
      where: { id: req.params.noteId },
    })

    await logAction(
      req.user.facilityId,
      'delete_caregiver_note',
      'CaregiverNote',
      req.params.noteId
    )

    res.json({ ok: true })
  } catch (err) {
    console.error('Delete caregiver note error:', err)
    res.status(500).json({ error: 'Failed to delete note' })
  }
})

// ═════════════════════════════════════════════════════════════════════════════
// TTS PREFERENCE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/children/:childId/tts-preference
router.get('/:childId/tts-preference', requireAuth, async (req, res) => {
  try {
    const child = await prisma.child.findFirst({
      where: { id: req.params.childId, facilityId: req.user.facilityId },
      include: { ttsPreference: true },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    res.json(
      child.ttsPreference || {
        provider: 'BROWSER',
        voiceId: 'default',
        voiceName: 'Default Browser Voice',
      }
    )
  } catch (err) {
    console.error('Fetch TTS preference error:', err)
    res.status(500).json({ error: 'Failed to fetch TTS preference' })
  }
})

// PATCH /api/children/:childId/tts-preference
router.patch('/:childId/tts-preference', requireAuth, async (req, res) => {
  try {
    const { provider, voiceId, voiceName, language, gender } = req.body

    const child = await prisma.child.findFirst({
      where: { id: req.params.childId, facilityId: req.user.facilityId },
    })

    if (!child) {
      return res.status(404).json({ error: 'Child not found' })
    }

    // Create or update TTS preference
    let ttsPreference = await prisma.tTSPreference.upsert({
      where: { id: child.ttsPreferenceId || '' },
      create: {
        provider: provider || 'BROWSER',
        voiceId: voiceId || 'default',
        voiceName: voiceName || 'Default Voice',
        language: language || 'en-US',
        gender,
      },
      update: {
        provider: provider || undefined,
        voiceId: voiceId || undefined,
        voiceName: voiceName || undefined,
        language: language || undefined,
        gender,
      },
    })

    // Update child to reference this preference
    await prisma.child.update({
      where: { id: req.params.childId },
      data: { ttsPreferenceId: ttsPreference.id },
    })

    await logAction(
      req.user.facilityId,
      'update_tts_preference',
      'TTSPreference',
      ttsPreference.id,
      { provider, voiceId, voiceName }
    )

    res.json(ttsPreference)
  } catch (err) {
    console.error('Update TTS preference error:', err)
    res.status(500).json({ error: 'Failed to update TTS preference' })
  }
})

module.exports = router
