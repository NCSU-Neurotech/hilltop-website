import { describe, it, expect } from 'vitest'
import { VOICES, getVoiceById } from './voices'

describe('Voice registry', () => {
  it('every ELEVENLABS voice carries a real elevenLabsVoiceId', () => {
    VOICES.filter((v) => v.provider === 'ELEVENLABS').forEach((v) => {
      expect(typeof v.elevenLabsVoiceId).toBe('string')
      expect(v.elevenLabsVoiceId.length).toBeGreaterThan(0)
    })
  })

  it('BROWSER voices carry no elevenLabsVoiceId (nothing to pass to the API)', () => {
    VOICES.filter((v) => v.provider === 'BROWSER').forEach((v) => {
      expect(v.elevenLabsVoiceId).toBeUndefined()
    })
  })

  it('getVoiceById finds a voice by its app-internal id', () => {
    expect(getVoiceById('bella').elevenLabsVoiceId).toBe('EXAVITQu4vr4xnSDxMaL')
    expect(getVoiceById('adam').elevenLabsVoiceId).toBe('pNInz6obpgDQGcFmaJgB')
    expect(getVoiceById('default').provider).toBe('BROWSER')
  })

  it('getVoiceById falls back to the first (default) voice for an unknown id', () => {
    expect(getVoiceById('not-a-real-id')).toBe(VOICES[0])
  })
})
