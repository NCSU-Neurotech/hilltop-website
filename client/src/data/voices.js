/**
 * Voice options offered in Settings. ElevenLabs entries carry the real
 * ElevenLabs voice id (elevenLabsVoiceId) — actually needed to request that
 * specific voice from the API. Bella and Adam are ElevenLabs' well-known
 * default "premade" voices, present on every account, so these IDs are
 * publicly stable — but verify them once a real API key exists; if
 * ElevenLabs ever retires a premade voice, its id would need updating here.
 */
export const VOICES = [
  { id: 'default', name: 'Default Browser Voice', provider: 'BROWSER' },
  { id: 'bella', name: 'Bella (ElevenLabs)', provider: 'ELEVENLABS', gender: 'female', elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL' },
  { id: 'adam', name: 'Adam (ElevenLabs)', provider: 'ELEVENLABS', gender: 'male', elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB' },
  { id: 'child', name: 'Child Voice', provider: 'BROWSER' },
]

export function getVoiceById(id) {
  return VOICES.find((v) => v.id === id) || VOICES[0]
}
