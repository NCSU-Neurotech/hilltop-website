/**
 * ScanGroup + ScanItem integration tests
 *
 * These tests verify the declarative registration flow end-to-end:
 * ScanItem registers → ScanGroup builds items → useScanEngine cycles → spacebar fires.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ScanGroup } from './ScanGroup'
import ScanItem from './ScanItem'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function spacebar() {
  const e = new KeyboardEvent('keydown', { code: 'Space', bubbles: true })
  Object.defineProperty(e, 'preventDefault', { value: vi.fn() })
  return e
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('ScanGroup + ScanItem — rendering', () => {
  it('renders children', () => {
    render(
      <ScanGroup active={false}>
        <ScanItem>Alpha</ScanItem>
        <ScanItem>Beta</ScanItem>
      </ScanGroup>
    )
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
  })

  it('applies scan-active class to first item on mount when active', async () => {
    render(
      <ScanGroup active scanSpeedMs={500}>
        <ScanItem data-testid="a">A</ScanItem>
        <ScanItem data-testid="b">B</ScanItem>
      </ScanGroup>
    )
    // Registration happens in useLayoutEffect (sync), items update triggers re-render.
    // After React flushes, item A should be active.
    const a = screen.getByTestId('a')
    expect(a.className).toContain('scan-active')
    expect(screen.getByTestId('b').className).not.toContain('scan-active')
  })

  it('does NOT apply scan-active when active=false', () => {
    render(
      <ScanGroup active={false} scanSpeedMs={500}>
        <ScanItem data-testid="a">A</ScanItem>
      </ScanGroup>
    )
    expect(screen.getByTestId('a').className).not.toContain('scan-active')
  })
})

// ---------------------------------------------------------------------------
// Cycling
// ---------------------------------------------------------------------------

describe('ScanGroup + ScanItem — cycling', () => {
  it('advances highlight to next item after one interval', () => {
    render(
      <ScanGroup active scanSpeedMs={500}>
        <ScanItem data-testid="a">A</ScanItem>
        <ScanItem data-testid="b">B</ScanItem>
        <ScanItem data-testid="c">C</ScanItem>
      </ScanGroup>
    )
    act(() => { vi.advanceTimersByTime(500) })
    expect(screen.getByTestId('b').className).toContain('scan-active')
    expect(screen.getByTestId('a').className).not.toContain('scan-active')
  })

  it('wraps around to first item', () => {
    render(
      <ScanGroup active scanSpeedMs={500}>
        <ScanItem data-testid="a">A</ScanItem>
        <ScanItem data-testid="b">B</ScanItem>
      </ScanGroup>
    )
    act(() => { vi.advanceTimersByTime(1000) }) // A→B→A
    expect(screen.getByTestId('a').className).toContain('scan-active')
  })
})

// ---------------------------------------------------------------------------
// Spacebar selection
// ---------------------------------------------------------------------------

describe('ScanGroup + ScanItem — spacebar selection', () => {
  it('fires onSelect of the active item on spacebar', () => {
    const handleA = vi.fn()
    const handleB = vi.fn()
    render(
      <ScanGroup active scanSpeedMs={500}>
        <ScanItem onSelect={handleA}>A</ScanItem>
        <ScanItem onSelect={handleB}>B</ScanItem>
      </ScanGroup>
    )
    // First item is active
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(handleA).toHaveBeenCalledTimes(1)
    expect(handleB).not.toHaveBeenCalled()
  })

  it('fires onSelect of the second item after one tick', () => {
    const handleA = vi.fn()
    const handleB = vi.fn()
    render(
      <ScanGroup active scanSpeedMs={500}>
        <ScanItem onSelect={handleA}>A</ScanItem>
        <ScanItem onSelect={handleB}>B</ScanItem>
      </ScanGroup>
    )
    act(() => { vi.advanceTimersByTime(500) })
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(handleB).toHaveBeenCalledTimes(1)
    expect(handleA).not.toHaveBeenCalled()
  })

  it('does NOT fire when active=false', () => {
    const handle = vi.fn()
    render(
      <ScanGroup active={false} scanSpeedMs={500}>
        <ScanItem onSelect={handle}>A</ScanItem>
      </ScanGroup>
    )
    act(() => { document.dispatchEvent(spacebarEvent()) })
    expect(handle).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Disabled items
// ---------------------------------------------------------------------------

describe('ScanGroup + ScanItem — disabled', () => {
  it('disabled item is skipped in the scan cycle', () => {
    const handleA = vi.fn()
    const handleB = vi.fn()
    render(
      <ScanGroup active scanSpeedMs={500}>
        <ScanItem onSelect={handleA} data-testid="a">A</ScanItem>
        <ScanItem onSelect={handleB} disabled data-testid="b">B</ScanItem>
      </ScanGroup>
    )
    // Only A registered — cycling wraps back to A after one tick
    act(() => { vi.advanceTimersByTime(500) })
    expect(screen.getByTestId('a').className).toContain('scan-active')
  })
})

// ---------------------------------------------------------------------------
// Standalone mode (no ScanGroup)
// ---------------------------------------------------------------------------

describe('ScanItem — standalone mode', () => {
  it('applies scan-active when isActive=true is passed directly', () => {
    render(<ScanItem isActive data-testid="solo">Solo</ScanItem>)
    expect(screen.getByTestId('solo').className).toContain('scan-active')
  })

  it('does not apply scan-active when isActive=false', () => {
    render(<ScanItem isActive={false} data-testid="solo">Solo</ScanItem>)
    expect(screen.getByTestId('solo').className).not.toContain('scan-active')
  })

  it('calls onSelect when clicked (caregiver mode)', () => {
    const handle = vi.fn()
    render(<ScanItem onSelect={handle} data-testid="solo">Solo</ScanItem>)
    screen.getByTestId('solo').click()
    expect(handle).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Helpers (local to this file)
// ---------------------------------------------------------------------------

function spacebarEvent() {
  const e = new KeyboardEvent('keydown', { code: 'Space', bubbles: true })
  Object.defineProperty(e, 'preventDefault', { value: vi.fn() })
  return e
}
