/**
 * Regression tests: starting a new sound must stop whatever's currently
 * playing, including the race where a slow-to-resolve audio.play() promise
 * from an earlier click could otherwise clobber a faster-resolving later
 * click and end up layered on top of it.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SoundGrid } from './SoundBoards'

function makeDeferred() {
  let resolve
  const promise = new Promise((res) => { resolve = res })
  return { promise, resolve }
}

let audioInstances

class MockAudio {
  constructor(src) {
    this.src = src
    this.currentTime = 0
    this.pause = vi.fn()
    this._deferred = makeDeferred()
    this.play = vi.fn(() => this._deferred.promise)
    audioInstances.push(this)
  }
}

const SOUNDS = [
  { id: 'a', name: 'Sound A', emoji: '🅰️', uri: '/sounds/test/a.mp3' },
  { id: 'b', name: 'Sound B', emoji: '🅱️', uri: '/sounds/test/b.mp3' },
  { id: 'c', name: 'Sound C', emoji: '🇨', uri: '/sounds/test/c.mp3' },
]

function renderGrid() {
  return render(
    <SoundGrid
      sounds={SOUNDS}
      activeBoard={{ id: 'test-board' }}
      childId="child-1"
      isChildMode={false}
      scanProfile={{ scanSpeedMs: 1200, scanHighlightColor: '#FFD700' }}
    />
  )
}

beforeEach(() => {
  audioInstances = []
  vi.stubGlobal('Audio', MockAudio)
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('SoundGrid — stopping the previous sound', () => {
  it('pauses the first sound when a second one starts (sequential clicks)', async () => {
    renderGrid()

    fireEvent.click(screen.getByText('Sound A'))
    await audioInstances[0]._deferred.resolve()
    await Promise.resolve() // let the await in handlePlaySound settle

    fireEvent.click(screen.getByText('Sound B'))
    await audioInstances[1]._deferred.resolve()
    await Promise.resolve()

    expect(audioInstances[0].pause).toHaveBeenCalled()
  })

  it('does not pause a sound that is still the current one', async () => {
    renderGrid()

    fireEvent.click(screen.getByText('Sound A'))
    await audioInstances[0]._deferred.resolve()
    await Promise.resolve()

    // Nothing else has played since — A should still be considered current.
    expect(audioInstances[0].pause).not.toHaveBeenCalled()
  })

  it('handles the race where an earlier click resolves after a later one', async () => {
    renderGrid()

    // Click A, then B, before A's play() promise has resolved — simulates
    // a slow network/decoder for A racing against a fast one for B.
    fireEvent.click(screen.getByText('Sound A'))
    fireEvent.click(screen.getByText('Sound B'))

    // B resolves first.
    audioInstances[1]._deferred.resolve()
    await Promise.resolve()
    await Promise.resolve()

    // A resolves late, after B has already taken over as "current".
    audioInstances[0]._deferred.resolve()
    await Promise.resolve()
    await Promise.resolve()

    // A must be stopped even though its own play() resolved after B's —
    // it was superseded and should never be treated as the current sound.
    expect(audioInstances[0].pause).toHaveBeenCalled()

    // Confirm B (not A) is what's actually tracked as current: playing a
    // third sound should stop B, not silently leave it running.
    fireEvent.click(screen.getByText('Sound C'))
    audioInstances[2]._deferred.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(audioInstances[1].pause).toHaveBeenCalled()
  })
})
