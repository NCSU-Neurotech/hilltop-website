/**
 * AccessibilityContext — Font size, high contrast, dark mode preferences
 *
 * Stored per child in database + applied via CSS variables.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AccessibilityContext = createContext(null)

export function AccessibilityProvider({ children }) {
  const [fontSizeRem, setFontSizeRem] = useState(1.0)
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [darkModeOverride, setDarkModeOverride] = useState(null) // null | 'light' | 'dark'

  // Apply CSS variables whenever settings change
  useEffect(() => {
    const root = document.documentElement

    // Tailwind's spacing, radius, and font-size utilities are all expressed
    // in rem, i.e. relative to this root element's font-size. Scaling root
    // font-size for "bigger text" was therefore also scaling every padding,
    // gap, and rounded corner in the app — a whole-page zoom, not a text
    // change. Freeze those non-typography tokens to fixed px (captured once,
    // before any scaling is ever applied) so only text size responds.
    if (!root.dataset.a11yBaseFrozen) {
      const computed = getComputedStyle(root)
      const TOKENS = [
        '--spacing',
        '--radius-xs', '--radius-sm', '--radius-md', '--radius-lg',
        '--radius-xl', '--radius-2xl', '--radius-3xl', '--radius-4xl',
        // max-w-* utilities (used everywhere for page content width) are
        // ALSO rem-based via these tokens — missing this was the actual
        // remaining cause of "the whole screen zooms": container widths
        // were growing right along with the font size.
        '--container-xs', '--container-sm', '--container-md', '--container-lg',
        '--container-xl', '--container-2xl', '--container-3xl', '--container-4xl',
        '--container-5xl', '--container-6xl', '--container-7xl',
      ]
      TOKENS.forEach((token) => {
        const remValue = parseFloat(computed.getPropertyValue(token))
        if (!Number.isNaN(remValue)) {
          root.style.setProperty(token, `${remValue * 16}px`)
        }
      })
      root.dataset.a11yBaseFrozen = '1'
    }

    // Font size — the only thing accessibility scaling should affect
    root.style.setProperty('--font-size-scale', fontSizeRem.toString())
    root.style.fontSize = `${fontSizeRem * 16}px`

    // High contrast
    if (highContrastMode) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Dark mode override
    if (darkModeOverride === 'dark') {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark-mode')
    } else if (darkModeOverride === 'light') {
      root.setAttribute('data-theme', 'light')
      root.classList.remove('dark-mode')
    } else {
      root.removeAttribute('data-theme')
      root.classList.remove('dark-mode')
    }
  }, [fontSizeRem, highContrastMode, darkModeOverride])

  const updateAccessibility = useCallback((settings) => {
    if ('fontSizeRem' in settings) setFontSizeRem(Math.max(0.8, Math.min(2.0, settings.fontSizeRem)))
    if ('highContrastMode' in settings) setHighContrastMode(settings.highContrastMode)
    if ('darkModeOverride' in settings) setDarkModeOverride(settings.darkModeOverride)
  }, [])

  const value = {
    fontSizeRem,
    highContrastMode,
    darkModeOverride,
    updateAccessibility,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used inside <AccessibilityProvider>')
  return ctx
}
