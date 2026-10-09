import { describe, it, expect } from 'vitest'
import { INSTRUMENT_KITS, getInstrumentKit } from './instrumentKits'

describe('instrument kits', () => {
  it('has unique kit ids and unique sound ids within each kit', () => {
    const kitIds = INSTRUMENT_KITS.map((k) => k.id)
    expect(new Set(kitIds).size).toBe(kitIds.length)
    INSTRUMENT_KITS.forEach((kit) => {
      const ids = kit.sounds.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  it('points every sound at its kit folder under /sounds/instrument-kits', () => {
    INSTRUMENT_KITS.forEach((kit) => {
      kit.sounds.forEach((s) => {
        expect(s.uri).toBe(`/sounds/instrument-kits/${kit.id}/${s.id}.mp3`)
      })
    })
  })

  it('gives every sound something to show on its tile', () => {
    INSTRUMENT_KITS.forEach((kit) => {
      kit.sounds.forEach((s) => expect(s.emoji ?? s.label).toBeTruthy())
    })
  })

  it('looks kits up by id', () => {
    expect(getInstrumentKit('drum-kit')?.name).toBe('Drum Kit')
    expect(getInstrumentKit('nope')).toBeNull()
  })
})
