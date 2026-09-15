import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import VIDEOS, { getVideosForStory, getAllVideos, getStandaloneVideos, getVideoById } from './videos'

describe('Video registry (stories/videos.js)', () => {
  // The real registry ships empty (no in-app upload flow — the team adds
  // entries directly). Seed the live array for these tests, since it's the
  // same object reference the getter functions read from, then restore it
  // afterward so this file leaves the module the way it found it.
  const original = [...VIDEOS]

  beforeEach(() => {
    VIDEOS.length = 0
    VIDEOS.push(
      { id: 'story-vid-1', title: 'Cinderella', reader: 'Ms. Jane', videoUrl: 'https://example.com/a.mp4', thumbnail: '🎥', storyId: 'cinderella' },
      { id: 'story-vid-2', title: 'Cinderella (encore)', reader: 'Mr. Lee', videoUrl: 'https://example.com/b.mp4', thumbnail: '🎥', storyId: 'cinderella' },
      { id: 'standalone-vid-1', title: 'A Trip to Our Garden', reader: 'Ms. Ada', videoUrl: 'https://example.com/c.mp4', thumbnail: '🎥' },
    )
  })

  afterEach(() => {
    VIDEOS.length = 0
    VIDEOS.push(...original)
  })

  it('getAllVideos returns every entry', () => {
    expect(getAllVideos()).toHaveLength(3)
  })

  it('getVideosForStory returns only videos linked to that story, in order', () => {
    const linked = getVideosForStory('cinderella')
    expect(linked).toHaveLength(2)
    expect(linked[0].id).toBe('story-vid-1')
    expect(linked[1].id).toBe('story-vid-2')
  })

  it('getVideosForStory returns an empty array for a story with no videos', () => {
    expect(getVideosForStory('goldilocks')).toEqual([])
  })

  it('getStandaloneVideos returns only videos with no storyId', () => {
    const standalone = getStandaloneVideos()
    expect(standalone).toHaveLength(1)
    expect(standalone[0].id).toBe('standalone-vid-1')
  })

  it('getVideoById finds a video by id regardless of story link', () => {
    expect(getVideoById('story-vid-1')?.title).toBe('Cinderella')
    expect(getVideoById('standalone-vid-1')?.title).toBe('A Trip to Our Garden')
  })

  it('getVideoById returns null for an unknown id', () => {
    expect(getVideoById('nope')).toBeNull()
  })
})
