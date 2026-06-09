/**
 * useSpeech — TTS hook with ElevenLabs primary and Web Speech API fallback.
 *
 * Primary path: POST /api/tts → audio/mpeg → play via Audio element.
 * Fallback: Web Speech API (used when server returns 503 "not configured"
 *           or any network error occurs).
 *
 * Usage:
 *   const { speak, cancel } = useSpeech()
 *   speak('Hello!')
 */
import { useCallback, useRef, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ---------------------------------------------------------------------------
// Web Speech API fallback
// ---------------------------------------------------------------------------

const PREFERRED_VOICE_KEYWORDS = [
  'Google US English',
  'Microsoft Aria Online (Natural)',
  'Microsoft Jenny Online (Natural)',
  'Microsoft Aria - Online (Natural)',
  'Microsoft Jenny - Online (Natural)',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Natasha Online',
  'Microsoft Zira Online',
  'Microsoft Zira',
  'Google UK English Female',
  'Google UK English',
  'Samantha',
  'Karen',
  'Daniel',
  'Moira',
]

function pickVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  for (const keyword of PREFERRED_VOICE_KEYWORDS) {
    const found = voices.find((v) => v.name.includes(keyword) || v.voiceURI.includes(keyword))
    if (found) return found
  }
  return (
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en')) ||
    voices[0]
  )
}

function speakFallback(text, voiceRef, { rate = 0.92, pitch = 1.0, volume = 0.95 } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  if (window.speechSynthesis.paused) window.speechSynthesis.resume()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate   = rate
  utt.pitch  = pitch
  utt.volume = volume
  if (!voiceRef.current) voiceRef.current = pickVoice()
  if (voiceRef.current) {
    utt.voice = voiceRef.current
    utt.lang  = voiceRef.current.lang || 'en-US'
  } else {
    utt.lang = 'en-US'
  }
  setTimeout(() => window.speechSynthesis.speak(utt), 80)
}

// ---------------------------------------------------------------------------
// ElevenLabs via server proxy
// ---------------------------------------------------------------------------

async function speakElevenLabs(text, audioRef) {
  const res = await fetch(`${API}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}`)
  const blob = await res.blob()
  const url  = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audioRef.current = audio
  audio.onended = () => URL.revokeObjectURL(url)
  await audio.play()
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSpeech() {
  const voiceRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    function resolveVoice() { voiceRef.current = pickVoice() }
    resolveVoice()
    window.speechSynthesis?.addEventListener('voiceschanged', resolveVoice)
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', resolveVoice)
  }, [])

  const speak = useCallback(async (text, opts = {}) => {
    // Stop anything currently playing
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    window.speechSynthesis?.cancel()

    try {
      await speakElevenLabs(text, audioRef)
    } catch {
      speakFallback(text, voiceRef, opts)
    }
  }, [])

  const cancel = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    window.speechSynthesis?.cancel()
  }, [])

  return { speak, cancel }
}
