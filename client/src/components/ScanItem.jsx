/**
 * ScanItem — scan-able element wrapper
 *
 * Makes any DOM element a participant in a scan cycle. Works in two modes:
 *
 * 1. Declarative (inside <ScanGroup>)  ← preferred for UI screens
 *    Just wrap your element. ScanItem registers itself automatically in DOM order.
 *
 *      <ScanGroup active={isChildMode} scanSpeedMs={1200}>
 *        <ScanItem onSelect={() => navigate('/games')}>
 *          <HubTile label="Games" />
 *        </ScanItem>
 *        <ScanItem onSelect={() => navigate('/learn')}>
 *          <HubTile label="Learn" />
 *        </ScanItem>
 *      </ScanGroup>
 *
 * 2. Standalone / imperative (outside ScanGroup, driven by useScanEngine)  ← for games
 *    Pass `isActive` manually. ScanItem is purely visual in this mode.
 *
 *      const { activeIndex } = useScanEngine(items, { active, scanSpeedMs })
 *      tiles.map((t, i) => (
 *        <ScanItem key={t.id} isActive={activeIndex === i}>
 *          ...
 *        </ScanItem>
 *      ))
 *
 * Props:
 *   onSelect        — Called when spacebar fires on this item (or on click in caregiver mode).
 *   isActive        — Standalone mode: whether this item is currently highlighted.
 *                     In declarative (ScanGroup) mode, this is ignored.
 *   as              — Element type to render (default 'button').
 *   highlightColor  — CSS color for the focus ring. Falls back to ScanGroup color → '#FFD700'.
 *   disabled        — Removes this item from the scan cycle when true.
 *   className, style, children, ...rest — forwarded to the root element.
 *
 * Accessibility:
 *   - Renders as <button> by default for correct keyboard semantics in caregiver mode.
 *   - aria-current="true" when active for screen reader announcement.
 *   - tabIndex={-1} so native focus doesn't conflict with the scan highlight.
 *   - Minimum 80×80 px enforced (spec requirement) unless caller explicitly overrides.
 */
import { useId, useRef, useLayoutEffect, useCallback } from 'react'
import { useScanGroup } from './ScanGroupContext'

export default function ScanItem({
  onSelect,
  isActive: isActiveProp,
  as: Tag = 'button',
  highlightColor: colorProp,
  disabled = false,
  className = '',
  style = {},
  children,
  ...rest
}) {
  const id = useId()
  const group = useScanGroup()

  // Keep the latest onSelect in a ref — the registered stable wrapper always
  // calls the current version without triggering re-registration.
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // ---------------------------------------------------------------------------
  // Registration with ScanGroup (declarative mode)
  // React runs useLayoutEffect for siblings in DOM order, so insertion order
  // into the Map == visual order == scan order. No explicit ordering needed.
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    if (!group || disabled) return
    const deregister = group.register(id, () => () => {
      if (typeof onSelectRef.current === 'function') onSelectRef.current()
    })
    return deregister
  // onSelect intentionally omitted — the ref keeps it fresh without re-registering.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, id, disabled])

  // ---------------------------------------------------------------------------
  // Active state — group takes precedence over prop
  // ---------------------------------------------------------------------------
  const isActive = group ? group.activeId === id : (isActiveProp ?? false)
  const color = colorProp ?? group?.highlightColor ?? '#FFD700'

  // ---------------------------------------------------------------------------
  // Click handler (caregiver mode: mouse/keyboard clicks still work)
  // ---------------------------------------------------------------------------
  const handleClick = useCallback(() => {
    if (disabled) return
    if (typeof onSelectRef.current === 'function') onSelectRef.current()
  }, [disabled])

  return (
    <Tag
      className={`scan-item ${isActive ? 'scan-active' : ''} ${className}`}
      style={{
        minWidth: 80,
        minHeight: 80,
        ...(isActive && {
          outlineColor: color,
          backgroundColor: hexToRgba(color, 0.12),
        }),
        ...style,
      }}
      aria-current={isActive ? 'true' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * hexToRgba('#FFD700', 0.12) → 'rgba(255,215,0,0.12)'
 * Handles 3- and 6-digit hex strings. Falls back gracefully on bad input.
 */
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(0,0,0,${alpha})`
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  if (full.length !== 6) return `rgba(0,0,0,${alpha})`
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
