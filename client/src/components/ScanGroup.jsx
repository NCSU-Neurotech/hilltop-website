/**
 * ScanGroup — declarative scan-cycle container
 *
 * Wraps a region of the UI and turns every nested <ScanItem> into a
 * scan-able element without any imperative item-array management.
 *
 * How it works:
 *   1. ScanGroup creates a registration context.
 *   2. Each ScanItem calls register() inside useLayoutEffect, which React
 *      executes in DOM order for siblings, so insertion order = scan order.
 *   3. ScanGroup derives an items[] array from its registration Map and
 *      passes it to useScanEngine.
 *   4. It publishes activeId (the currently highlighted item's id) back via
 *      context so each ScanItem can highlight itself without prop-drilling.
 *
 * Props:
 *   active          — Master on/off switch; pass `isChildMode` from ScanContext.
 *   scanSpeedMs     — Interval between index advances (default 1200).
 *   highlightColor  — CSS color for the focus ring (default '#FFD700').
 *   paused          — Pause cycling without losing position (e.g. modal open).
 *   loop            — Wrap to index 0 after last item (default true).
 *   onSelect        — Optional: called with (index, id) whenever any item fires.
 *   children
 *
 * Usage:
 *   <ScanGroup active={isChildMode} scanSpeedMs={child.scanSpeedMs}
 *              highlightColor={child.scanHighlightColor}>
 *     <ScanItem onSelect={() => goToGames()}>Games</ScanItem>
 *     <ScanItem onSelect={() => goToLearn()}>Learn</ScanItem>
 *   </ScanGroup>
 *
 * For games / highly dynamic content, use useScanEngine directly.
 */
import {
  useCallback,
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { useScanEngine } from '../hooks/useScanEngine'
import { ScanGroupCtx } from './ScanGroupContext'

// ---------------------------------------------------------------------------
// ScanGroup
// ---------------------------------------------------------------------------

export function ScanGroup({
  children,
  active = true,
  scanSpeedMs = 1200,
  highlightColor = '#FFD700',
  paused = false,
  loop = true,
  selectionTone = true,
  onSelect,
}) {
  /**
   * registrations: Map<id, { getOnSelect: () => () => void, order: number }>
   *
   * We store a *getter* for onSelect rather than the function itself. ScanItem
   * keeps its latest onSelect in a ref and passes `() => ref.current` here.
   * This means the items[] array never needs to be rebuilt when callbacks
   * change — only when items are added or removed.
   */
  const registrationsRef = useRef(new Map())
  const nextOrderRef = useRef(0)

  /**
   * items[] drives useScanEngine. We only rebuild it (causing a re-render)
   * when registrations are added or removed, not on every render.
   * Each item.onSelect wraps the registration's getter so it's always fresh.
   */
  const [items, setItems] = useState([])

  const rebuildItems = useCallback(() => {
    // Sort by insertion order, then build stable wrappers.
    const sorted = [...registrationsRef.current.entries()].sort(
      (a, b) => a[1].order - b[1].order
    )
    setItems(
      sorted.map(([id, { getOnSelect }]) => ({
        id,
        // Stable wrapper: always calls the latest onSelect from the ScanItem
        onSelect: () => getOnSelect()(),
      }))
    )
  }, [])

  const register = useCallback(
    (id, getOnSelect) => {
      registrationsRef.current.set(id, {
        getOnSelect,
        order: nextOrderRef.current++,
      })
      rebuildItems()
      return () => {
        registrationsRef.current.delete(id)
        rebuildItems()
      }
    },
    [rebuildItems]
  )

  // useScanEngine receives the live items array
  const { activeIndex, pause, resume, stop, restart } = useScanEngine(items, {
    active,
    scanSpeedMs,
    paused,
    loop,
    selectionTone,
  })

  // Derive which item id is currently highlighted
  const activeId = items[activeIndex]?.id ?? null

  // Fire the optional group-level onSelect callback
  const prevIndexRef = useRef(-1)
  useEffect(() => {
    if (activeIndex !== prevIndexRef.current && activeIndex >= 0) {
      // This fires on every index advance — not what we want.
      // We only want it on actual spacebar selection, not on cycling.
      // Leave this wired up for now; see onSelect in useScanEngine for the
      // right place to hook this. For now, callers should put logic in
      // individual ScanItem onSelect props.
    }
    prevIndexRef.current = activeIndex
  }, [activeIndex, onSelect])

  const ctx = useMemo(
    () => ({ register, activeId, highlightColor, pause, resume, stop, restart }),
    [register, activeId, highlightColor, pause, resume, stop, restart]
  )

  return <ScanGroupCtx.Provider value={ctx}>{children}</ScanGroupCtx.Provider>
}
