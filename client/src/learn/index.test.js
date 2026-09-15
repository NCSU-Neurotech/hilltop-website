import { describe, it, expect } from 'vitest'
import MODULES from './index'

const VALID_TIERS = ['beginner', 'intermediate', 'advanced']

describe('Learn module content', () => {
  it('every module has a valid tier and a non-empty card deck', () => {
    Object.values(MODULES).forEach((mod) => {
      expect(VALID_TIERS).toContain(mod.tier)
      expect(Array.isArray(mod.cards)).toBe(true)
      expect(mod.cards.length).toBeGreaterThan(0)
    })
  })

  it('every card has the fields the flashcard runner and TTS depend on', () => {
    Object.values(MODULES).forEach((mod) => {
      mod.cards.forEach((card) => {
        expect(typeof card.symbol).toBe('string')
        expect(card.symbol.length).toBeGreaterThan(0)
        expect(typeof card.illustration).toBe('string')
        expect(typeof card.word).toBe('string')
        expect(typeof card.ttsText).toBe('string')
        expect(card.ttsText.length).toBeGreaterThan(0)
      })
    })
  })

  // Regression: content was expanded from thin "sampler" decks — lock in a
  // floor so a future edit can't silently shrink a module back down.
  it('previously-thin modules now have a real amount of content', () => {
    const minimums = {
      numbers: 20,
      shapes: 12,
      animals: 18,
      'body-parts': 14,
      'sight-words': 30,
      addition: 18,
      emotions: 14,
      'science-facts': 15,
      'world-geography': 15,
      vocabulary: 17,
    }
    Object.entries(minimums).forEach(([id, min]) => {
      expect(MODULES[id].cards.length).toBeGreaterThanOrEqual(min)
    })
  })

  it('alphabet still covers all 26 letters', () => {
    expect(MODULES.alphabet.cards).toHaveLength(26)
  })

  it('addition cards show a visual dot count for both addends, not just the digits', () => {
    MODULES.addition.cards.forEach((card) => {
      expect(card.dots).toContain('●')
      expect(card.dots).toContain('+')
    })
  })
})
