/**
 * ScanContext — global child mode state
 *
 * Tracks whether Child Mode (single-switch scanning) is active and holds the
 * active child's scan profile settings. Every component that needs to know
 * "are we in child mode?" reads from this context.
 *
 * Switching modes is a caregiver action (mouse/keyboard). In Child Mode the
 * mode toggle is locked behind Escape so a child cannot accidentally exit.
 */
import { createContext, useContext, useState, useCallback } from 'react'

const ScanContext = createContext(null)

/**
 * Default scan profile — used when no child is selected or for fallback.
 * Matches the DB schema defaults.
 */
const DEFAULT_PROFILE = {
  scanSpeedMs: 1200,
  scanHighlightColor: '#FFD700',
  voiceRate: 0.85,
  voicePitch: 1.0,
}

export function ScanProvider({ children }) {
  const [isChildMode, setIsChildMode] = useState(false)
  const [activeChild, setActiveChild] = useState(null)
  // scanProfile is derived: activeChild's settings or defaults.
  const scanProfile = activeChild
    ? {
        scanSpeedMs: activeChild.scanSpeedMs ?? DEFAULT_PROFILE.scanSpeedMs,
        scanHighlightColor: activeChild.scanHighlightColor ?? DEFAULT_PROFILE.scanHighlightColor,
        voiceRate: activeChild.voiceRate ?? DEFAULT_PROFILE.voiceRate,
        voicePitch: activeChild.voicePitch ?? DEFAULT_PROFILE.voicePitch,
      }
    : DEFAULT_PROFILE

  /**
   * enterChildMode(child)
   * Activates scanning for the given child profile.
   * Pass null to use default scan settings.
   */
  const enterChildMode = useCallback((child = null) => {
    setActiveChild(child)
    setIsChildMode(true)
  }, [])

  /**
   * exitChildMode()
   * Returns to caregiver mode. Scanning stops everywhere.
   * This should only be reachable via Escape or a caregiver UI action.
   */
  const exitChildMode = useCallback(() => {
    setIsChildMode(false)
  }, [])

  /**
   * updateChild(updatedChild)
   * Call this when a child's settings change mid-session so the scan
   * profile updates live (e.g., caregiver changes scan speed in settings).
   */
  const updateChild = useCallback((updatedChild) => {
    setActiveChild(updatedChild)
  }, [])

  const value = {
    isChildMode,
    activeChild,
    scanProfile,
    enterChildMode,
    exitChildMode,
    updateChild,
  }

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>
}

export function useScan() {
  const ctx = useContext(ScanContext)
  if (!ctx) throw new Error('useScan must be used inside <ScanProvider>')
  return ctx
}
