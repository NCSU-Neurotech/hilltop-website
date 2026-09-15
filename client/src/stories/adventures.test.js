import { describe, it, expect } from 'vitest'
import ADVENTURES from './adventures'

describe('Group Storytime adventure content', () => {
  it('has at least 8 adventures (up from the original 5)', () => {
    expect(Object.keys(ADVENTURES).length).toBeGreaterThanOrEqual(8)
  })

  it('every adventure has the fields StorytimeNarrator/Listener depend on', () => {
    Object.entries(ADVENTURES).forEach(([key, adv]) => {
      expect(adv.id).toBe(key)
      expect(typeof adv.title).toBe('string')
      expect(typeof adv.emoji).toBe('string')
      expect(typeof adv.color).toBe('string')
      expect(typeof adv.startNode).toBe('string')
      expect(adv.nodes[adv.startNode]).toBeDefined()
    })
  })

  it('every node has illustration + text, and either choices or isEnding — never neither', () => {
    Object.values(ADVENTURES).forEach((adv) => {
      Object.entries(adv.nodes).forEach(([key, node]) => {
        expect(typeof node.illustration).toBe('string')
        expect(typeof node.text).toBe('string')
        expect(node.text.trim().length).toBeGreaterThan(0)

        if (node.isEnding) {
          expect(node.choices).toBeNull()
        } else {
          expect(Array.isArray(node.choices)).toBe(true)
          expect(node.choices.length).toBeGreaterThan(0)
        }
      })
    })
  })

  it('every choice.next points at a real node in the same adventure (no dead links)', () => {
    Object.values(ADVENTURES).forEach((adv) => {
      Object.values(adv.nodes).forEach((node) => {
        node.choices?.forEach((choice) => {
          expect(adv.nodes[choice.next]).toBeDefined()
        })
      })
    })
  })

  it('every adventure has at least one reachable ending from its start node', () => {
    Object.values(ADVENTURES).forEach((adv) => {
      const visited = new Set()
      const stack = [adv.startNode]
      let foundEnding = false

      while (stack.length) {
        const key = stack.pop()
        if (visited.has(key)) continue
        visited.add(key)
        const node = adv.nodes[key]
        if (node.isEnding) { foundEnding = true; break }
        node.choices?.forEach((c) => stack.push(c.next))
      }

      expect(foundEnding).toBe(true)
    })
  })

  it('the 3 new adventures exist with the expected ids', () => {
    ;['sea-kingdom', 'space-race', 'time-travelers-attic'].forEach((id) => {
      expect(ADVENTURES[id]).toBeDefined()
    })
  })
})
