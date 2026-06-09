const express = require('express')
const router  = express.Router()

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const DEFAULT_VOICE_ID   = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

// POST /api/tts  { text, voiceId? }  → audio/mpeg
router.post('/', async (req, res) => {
  const { text, voiceId = DEFAULT_VOICE_ID } = req.body || {}
  if (!text) return res.status(400).json({ error: 'text is required' })
  if (!ELEVENLABS_API_KEY) return res.status(503).json({ error: 'TTS not configured' })

  try {
    const el = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key':   ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept:         'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    if (!el.ok) {
      const msg = await el.text()
      return res.status(el.status).json({ error: msg })
    }

    const buf = await el.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(buf))
  } catch (err) {
    console.error('TTS proxy error:', err)
    res.status(500).json({ error: 'TTS request failed' })
  }
})

module.exports = router
