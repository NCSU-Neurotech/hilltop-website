/**
 * useScanEngine — single-switch auto-scan engine
 *
 * This is the core accessibility primitive for the entire app. It handles:
 *   - Cycling a highlight through a list of interactive items on a timer
 *   - Activating the currently highlighted item when spacebar is pressed
 *   - Starting, stopping, pausing, and resuming the scan cycle
 *   - Playing a pleasant Web Audio confirmation tone on selection
 *
 * Usage:
 *   const { activeIndex, pause, resume, stop } = useScanEngine(items, options)
 *
 *   items  — Array of { onSelect: () => void }.
 *            Order defines scan order. Rebuild the array to reorder or filter.
 *            Passing an empty array or active=false disables scanning entirely.
 *
 *   options.active       — Master switch. Set to `isChildMode` from ScanContext.
 *   options.scanSpeedMs  — Milliseconds between each index advance (default 1200).
 *   options.paused       — Temporarily pause cycling (e.g., modal is open).
 *                          The highlight stays visible but the timer stops and
 *                          spacebar is ignored.
 *   options.loop         — Whether to wrap around at the end (default true).
 *
 * Returns:
 *   activeIndex  — Index of the currently highlighted item (-1 = none).
 *   pause()      — Pauses the cycle (idempotent).
 *   resume()     — Resumes after pause (idempotent).
 *   stop()       — Stops and resets; call on component unmount if needed.
 *   restart()    — Resets to index 0 and starts over.
 */
import { useEffect, useRef, useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Audio confirmation tone (Web Audio API, no external files)
// ---------------------------------------------------------------------------

let _sharedAudioCtx = null

function getAudioContext() {
  if (!_sharedAudioCtx || _sharedAudioCtx.state === 'closed') {
    try {
      _sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }
  return _sharedAudioCtx
}

/**
 * Plays a short, pleasant two-tone chime (C5 → E5) to confirm selection.
 * Silently no-ops if Web Audio is unavailable.
 */
export function playSelectionTone() {
  const ctx = getAudioContext()
  if (!ctx) return

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume()

  const now = ctx.currentTime
  const gain = ctx.createGain()
  gain.connect(ctx.destination)

  const notes = [
    { freq: 523.25, start: 0,     dur: 0.12 },  // C5
    { freq: 659.25, start: 0.08,  dur: 0.15 },  // E5
  ]

  notes.forEach(({ freq, start, dur }) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g)
    g.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.value = freq

    g.gain.setValueAtTime(0, now + start)
    g.gain.linearRampToValueAtTime(0.25, now + start + 0.015)
    g.gain.exponentialRampToValueAtTime(0.001, now + start + dur)

    osc.start(now + start)
    osc.stop(now + start + dur + 0.01)
  })
}

// ---------------------------------------------------------------------------
// useScanEngine hook
// ---------------------------------------------------------------------------

export function useScanEngine(
  items,
  {
    active = true,
    scanSpeedMs = 1200,
    paused = false,
    loop = true,
    selectionTone = true,
  } = {}
) {
  const [activeIndex, setActiveIndex] = useState(-1)

  // Use refs for values accessed inside setInterval / event listeners so we
  // never capture stale closures.
  const indexRef         = useRef(-1)
  const itemsRef         = useRef(items)
  const activeRef        = useRef(active)
  const pausedRef        = useRef(paused)
  const loopRef          = useRef(loop)
  const intervalRef      = useRef(null)
  const scanSpeedRef     = useRef(scanSpeedMs)
  const selectionToneRef = useRef(selectionTone)

  // Keep refs in sync with latest prop values on every render.
  itemsRef.current      = items
  activeRef.current     = active
  pausedRef.current     = paused
  loopRef.current       = loop
  scanSpeedRef.current  = scanSpeedMs
  selectionToneRef.current = selectionTone

  // -------------------------------------------------------------------------
  // Internal helpers (stable refs, no re-renders)
  // -------------------------------------------------------------------------

  const setIndex = useCallback((idx) => {
    indexRef.current = idx
    setActiveIndex(idx)
  }, [])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    intervalRef.current = setInterval(() => {
      if (!activeRef.current || pausedRef.current) return
      const len = itemsRef.current.length
      if (len === 0) return

      const next = indexRef.current + 1
      if (next >= len) {
        if (loopRef.current) {
          setIndex(0)
        } else {
          // Stay on last item — don't advance further
        }
      } else {
        setIndex(next)
      }
    }, scanSpeedRef.current)
  }, [clearTimer, setIndex])

  // -------------------------------------------------------------------------
  // Public API — stable callbacks exposed to callers
  // -------------------------------------------------------------------------

  const pause = useCallback(() => {
    pausedRef.current = true
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    setIndex(-1)
  }, [clearTimer, setIndex])

  const restart = useCallback(() => {
    if (!activeRef.current || itemsRef.current.length === 0) return
    setIndex(0)
    startTimer()
  }, [setIndex, startTimer])

  // -------------------------------------------------------------------------
  // Effect: start/stop the timer when active or items change
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!active || items.length === 0) {
      clearTimer()
      setIndex(-1)
      return
    }

    // Start at 0 whenever active flips on or items list changes identity
    setIndex(0)
    startTimer()

    return clearTimer
  }, [active, items.length, startTimer, clearTimer, setIndex])
  // NOTE: We intentionally exclude `items` object identity from deps — only
  // length matters for restarting. Callers should memoize their items arrays
  // with useMemo if they want reorder/content changes to restart scanning.

  // -------------------------------------------------------------------------
  // Effect: restart timer when scanSpeedMs changes (user profile update)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!active || items.length === 0) return
    startTimer()
    return clearTimer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanSpeedMs])

  // -------------------------------------------------------------------------
  // Effect: spacebar listener — attached at document level in child mode
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!active) return

    function handleKeyDown(e) {
      // Only respond to spacebar; ignore if another key or paused
      if (e.code !== 'Space') return
      if (pausedRef.current) return

      // Prevent page scroll
      e.preventDefault()

      const idx = indexRef.current
      const items = itemsRef.current
      if (idx < 0 || idx >= items.length) return

      const item = items[idx]
      if (typeof item?.onSelect === 'function') {
        if (selectionToneRef.current) playSelectionTone()
        item.onSelect()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active])

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return { activeIndex, pause, resume, stop, restart }
}
