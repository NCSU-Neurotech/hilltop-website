import { describe, it, expect } from 'vitest'
import { hashString, getToneForSound } from './SoundBoards'

describe('Sound board tone generation', () => {
  // Regression test for the bug where every sound played an identical
  // hardcoded 800Hz beep regardless of which tile was pressed.
  describe('getToneForSound', () => {
    it('is deterministic — the same sound id always gets the same tone', () => {
      const a = getToneForSound('piano')
      const b = getToneForSound('piano')
      expect(a).toEqual(b)
    })

    it('gives different sounds within a board audibly different tones', () => {
      const boardIds = ['piano', 'drums', 'guitar', 'trumpet', 'violin']
      const tones = boardIds.map(getToneForSound)
      const signatures = new Set(tones.map((t) => `${t.freq}-${t.type}`))
      // Not a strict guarantee for arbitrary strings, but true for this
      // board's real ids — if this ever fails, widen TONE_NOTES/TONE_WAVEFORMS.
      expect(signatures.size).toBeGreaterThan(1)
    })

    it('always returns a valid frequency and oscillator type', () => {
      const VALID_TYPES = ['sine', 'triangle', 'square', 'sawtooth']
      ;['dog', 'cat', 'lion', 'rain', 'thunder'].forEach((id) => {
        const { freq, type } = getToneForSound(id)
        expect(typeof freq).toBe('number')
        expect(freq).toBeGreaterThan(0)
        expect(VALID_TYPES).toContain(type)
      })
    })
  })

  describe('hashString', () => {
    it('is deterministic and non-negative', () => {
      expect(hashString('abc')).toBe(hashString('abc'))
      expect(hashString('abc')).toBeGreaterThanOrEqual(0)
    })

    it('produces different hashes for different strings (typical case)', () => {
      expect(hashString('piano')).not.toBe(hashString('drums'))
    })
  })
})
