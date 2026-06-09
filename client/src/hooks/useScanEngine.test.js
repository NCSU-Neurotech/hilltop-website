/**
 * useScanEngine unit tests
 *
 * We use Vitest with fake timers so we can control the scan interval precisely
 * without real async waits.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScanEngine } from './useScanEngine'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItems(count) {
  return Array.from({ length: count }, (_, i) => ({
    onSelect: vi.fn(),
  }))
}

function spacebarEvent() {
  const e = new KeyboardEvent('keydown', { code: 'Space', bubbles: true })
  Object.defineProperty(e, 'preventDefault', { value: vi.fn() })
  return e
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useScanEngine — initial state', () => {
  it('starts at index 0 when active with items', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    expect(result.current.activeIndex).toBe(0)
  })

  it('starts at -1 when active=false', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: false, scanSpeedMs: 500 })
    )
    expect(result.current.activeIndex).toBe(-1)
  })

  it('starts at -1 when items array is empty', () => {
    const { result } = renderHook(() =>
      useScanEngine([], { active: true, scanSpeedMs: 500 })
    )
    expect(result.current.activeIndex).toBe(-1)
  })
})

describe('useScanEngine — timer cycling', () => {
  it('advances index on each interval tick', () => {
    const items = makeItems(4)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    expect(result.current.activeIndex).toBe(0)

    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.activeIndex).toBe(1)

    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.activeIndex).toBe(2)

    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.activeIndex).toBe(3)
  })

  it('wraps around to 0 when loop=true (default)', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500, loop: true })
    )
    // Advance past last item
    act(() => { vi.advanceTimersByTime(500 * 3) }) // 0→1→2→0
    expect(result.current.activeIndex).toBe(0)
  })

  it('stays on last item when loop=false', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500, loop: false })
    )
    act(() => { vi.advanceTimersByTime(500 * 5) }) // try to go past end
    expect(result.current.activeIndex).toBe(2)
  })
})

describe('useScanEngine — pause / resume', () => {
  it('does not advance while paused', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    act(() => { result.current.pause() })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.activeIndex).toBe(0)
  })

  it('resumes advancing after resume()', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    act(() => { result.current.pause() })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.activeIndex).toBe(0)

    act(() => { result.current.resume() })
    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.activeIndex).toBe(1)
  })
})

describe('useScanEngine — stop / restart', () => {
  it('stop() resets index to -1 and halts timer', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    act(() => { result.current.stop() })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(result.current.activeIndex).toBe(-1)
  })

  it('restart() resets to index 0 and resumes cycling', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    act(() => { vi.advanceTimersByTime(1000) }) // → index 2
    act(() => { result.current.restart() })
    expect(result.current.activeIndex).toBe(0)
    act(() => { vi.advanceTimersByTime(500) })
    expect(result.current.activeIndex).toBe(1)
  })
})

describe('useScanEngine — spacebar selection', () => {
  it('calls onSelect of the active item when spacebar is pressed', () => {
    const items = makeItems(3)
    renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    // activeIndex starts at 0
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(items[0].onSelect).toHaveBeenCalledTimes(1)
    expect(items[1].onSelect).not.toHaveBeenCalled()
  })

  it('calls onSelect on the correct item after cycling', () => {
    const items = makeItems(3)
    renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    act(() => { vi.advanceTimersByTime(1000) }) // → index 2
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(items[2].onSelect).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onSelect while paused', () => {
    const items = makeItems(3)
    const { result } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    act(() => { result.current.pause() })
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(items[0].onSelect).not.toHaveBeenCalled()
  })

  it('does NOT attach spacebar listener when active=false', () => {
    const items = makeItems(3)
    renderHook(() =>
      useScanEngine(items, { active: false, scanSpeedMs: 500 })
    )
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(items[0].onSelect).not.toHaveBeenCalled()
  })
})

describe('useScanEngine — active flag toggling', () => {
  it('resets to -1 when active switches to false', () => {
    const items = makeItems(3)
    let active = true
    const { result, rerender } = renderHook(
      ({ active }) => useScanEngine(items, { active, scanSpeedMs: 500 }),
      { initialProps: { active: true } }
    )
    act(() => { vi.advanceTimersByTime(500) }) // → 1
    rerender({ active: false })
    expect(result.current.activeIndex).toBe(-1)
  })

  it('restarts from 0 when active switches back to true', () => {
    const items = makeItems(3)
    const { result, rerender } = renderHook(
      ({ active }) => useScanEngine(items, { active, scanSpeedMs: 500 }),
      { initialProps: { active: false } }
    )
    expect(result.current.activeIndex).toBe(-1)
    rerender({ active: true })
    expect(result.current.activeIndex).toBe(0)
  })
})

describe('useScanEngine — cleanup on unmount', () => {
  it('clears timer on unmount without errors', () => {
    const items = makeItems(3)
    const { unmount } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    // Should not throw
    expect(() => {
      unmount()
      act(() => { vi.advanceTimersByTime(2000) })
    }).not.toThrow()
  })

  it('removes spacebar listener on unmount', () => {
    const items = makeItems(3)
    const { unmount } = renderHook(() =>
      useScanEngine(items, { active: true, scanSpeedMs: 500 })
    )
    unmount()
    // Spacebar after unmount should not call onSelect
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(items[0].onSelect).not.toHaveBeenCalled()
  })
})
