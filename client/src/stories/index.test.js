import { describe, it, expect } from 'vitest'
import STORIES from './index'

describe('Story content', () => {
  it('has at least 16 stories (10 classic fairy tales + 6 new original stories)', () => {
    expect(Object.keys(STORIES).length).toBeGreaterThanOrEqual(16)
  })

  it('every story has the fields StoryReader/Stories.jsx depend on', () => {
    Object.entries(STORIES).forEach(([key, story]) => {
      expect(story.id).toBe(key)
      expect(typeof story.title).toBe('string')
      expect(story.title.length).toBeGreaterThan(0)
      expect(typeof story.emoji).toBe('string')
      expect(typeof story.color).toBe('string')
      expect(Array.isArray(story.pages)).toBe(true)
      expect(story.pages.length).toBeGreaterThan(0)
    })
  })

  it('every page has TTS-ready text and an illustration', () => {
    Object.values(STORIES).forEach((story) => {
      story.pages.forEach((page) => {
        expect(typeof page.illustration).toBe('string')
        expect(page.illustration.length).toBeGreaterThan(0)
        expect(typeof page.text).toBe('string')
        expect(page.text.trim().length).toBeGreaterThan(0)
      })
    })
  })

  it('the 6 new original stories exist with the expected ids', () => {
    const newStoryIds = [
      'first-day-of-school',
      'new-friend-at-the-park',
      'class-garden',
      'ocean-cleanup-crew',
      'lantern-festival-night',
      'mias-marvelous-machine',
    ]
    newStoryIds.forEach((id) => {
      expect(STORIES[id]).toBeDefined()
      expect(STORIES[id].pages.length).toBeGreaterThanOrEqual(9)
    })
  })
})
