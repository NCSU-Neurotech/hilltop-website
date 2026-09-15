import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { AccessibilityProvider, useAccessibility } from './AccessibilityContext'

describe('AccessibilityContext', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.fontSize = ''
    delete document.documentElement.dataset.a11yBaseFrozen
    document.documentElement.style.removeProperty('--spacing')
    document.documentElement.style.removeProperty('--radius-lg')
    document.documentElement.style.removeProperty('--container-4xl')
  })

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const TestComponent = () => {
        const { fontSizeRem, highContrastMode, darkModeOverride } = useAccessibility()
        return (
          <div>
            <div data-testid="font-size">{fontSizeRem}</div>
            <div data-testid="high-contrast">{highContrastMode.toString()}</div>
            <div data-testid="dark-mode">{darkModeOverride || 'null'}</div>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      expect(screen.getByTestId('font-size')).toHaveTextContent('1')
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('false')
      expect(screen.getByTestId('dark-mode')).toHaveTextContent('null')
    })
  })

  describe('updateAccessibility', () => {
    it('should update font size', async () => {
      const TestComponent = () => {
        const { fontSizeRem, updateAccessibility } = useAccessibility()
        return (
          <div>
            <div data-testid="font-size">{fontSizeRem}</div>
            <button onClick={() => updateAccessibility({ fontSizeRem: 1.5 })}>Increase</button>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('1.5')
      })
    })

    it('should clamp font size between 0.8 and 2.0', async () => {
      const TestComponent = () => {
        const { fontSizeRem, updateAccessibility } = useAccessibility()
        return (
          <div>
            <div data-testid="font-size">{fontSizeRem}</div>
            <button onClick={() => updateAccessibility({ fontSizeRem: 3.0 })}>Too big</button>
            <button onClick={() => updateAccessibility({ fontSizeRem: 0.5 })}>Too small</button>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      // Test upper bound
      fireEvent.click(screen.getByText('Too big'))
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('2')
      })

      // Test lower bound
      fireEvent.click(screen.getByText('Too small'))
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('0.8')
      })
    })

    it('should toggle high contrast mode', async () => {
      const TestComponent = () => {
        const { highContrastMode, updateAccessibility } = useAccessibility()
        return (
          <div>
            <div data-testid="contrast">{highContrastMode.toString()}</div>
            <button onClick={() => updateAccessibility({ highContrastMode: true })}>On</button>
            <button onClick={() => updateAccessibility({ highContrastMode: false })}>Off</button>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      fireEvent.click(screen.getByText('On'))
      await waitFor(() => {
        expect(screen.getByTestId('contrast')).toHaveTextContent('true')
      })

      fireEvent.click(screen.getByText('Off'))
      await waitFor(() => {
        expect(screen.getByTestId('contrast')).toHaveTextContent('false')
      })
    })

    it('should update dark mode override', async () => {
      const TestComponent = () => {
        const { darkModeOverride, updateAccessibility } = useAccessibility()
        return (
          <div>
            <div data-testid="dark-mode">{darkModeOverride || 'null'}</div>
            <button onClick={() => updateAccessibility({ darkModeOverride: 'dark' })}>Dark</button>
            <button onClick={() => updateAccessibility({ darkModeOverride: 'light' })}>Light</button>
            <button onClick={() => updateAccessibility({ darkModeOverride: null })}>Auto</button>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      fireEvent.click(screen.getByText('Dark'))
      await waitFor(() => {
        expect(screen.getByTestId('dark-mode')).toHaveTextContent('dark')
      })

      fireEvent.click(screen.getByText('Light'))
      await waitFor(() => {
        expect(screen.getByTestId('dark-mode')).toHaveTextContent('light')
      })

      fireEvent.click(screen.getByText('Auto'))
      await waitFor(() => {
        expect(screen.getByTestId('dark-mode')).toHaveTextContent('null')
      })
    })
  })

  describe('CSS Application', () => {
    it('should apply font size to document root', async () => {
      const TestComponent = () => {
        const { updateAccessibility } = useAccessibility()
        return <button onClick={() => updateAccessibility({ fontSizeRem: 1.5 })}>Change</button>
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => {
        expect(document.documentElement.style.fontSize).toBe('24px')
      })
    })

    it('should add/remove high-contrast class', async () => {
      const TestComponent = () => {
        const { updateAccessibility } = useAccessibility()
        return (
          <div>
            <button onClick={() => updateAccessibility({ highContrastMode: true })}>On</button>
            <button onClick={() => updateAccessibility({ highContrastMode: false })}>Off</button>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      fireEvent.click(screen.getByText('On'))
      await waitFor(() => {
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
      })

      fireEvent.click(screen.getByText('Off'))
      await waitFor(() => {
        expect(document.documentElement.classList.contains('high-contrast')).toBe(false)
      })
    })

    it('should set data-theme attribute for dark mode', async () => {
      const TestComponent = () => {
        const { updateAccessibility } = useAccessibility()
        return (
          <div>
            <button onClick={() => updateAccessibility({ darkModeOverride: 'dark' })}>Dark</button>
            <button onClick={() => updateAccessibility({ darkModeOverride: null })}>Auto</button>
          </div>
        )
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      fireEvent.click(screen.getByText('Dark'))
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
      })

      fireEvent.click(screen.getByText('Auto'))
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBeNull()
      })
    })
  })

  describe('Font scaling should not zoom layout (regression)', () => {
    // Previously, increasing "text size" set the root <html> font-size
    // directly. Since Tailwind's spacing/radius scale is also expressed in
    // rem (relative to root font-size), every padding/gap/rounded-corner in
    // the app scaled too — a whole-page zoom, not a text-only change. Fixed
    // by freezing --spacing/--radius-* to fixed px the first time this
    // effect runs, before any font scaling is applied.
    it('freezes Tailwind spacing/radius/container tokens to px so they stop tracking root font-size', async () => {
      // Simulate what Tailwind's compiled CSS provides by default (rem,
      // relative to the untouched 16px root) — real tests don't load the
      // built stylesheet, so jsdom has no computed value for these otherwise.
      // --container-* is included here because it's the token that was
      // actually still causing the reported "whole screen zooms" bug: every
      // page uses max-w-* (backed by --container-*) for its content width,
      // and that was scaling right along with the font size.
      document.documentElement.style.setProperty('--spacing', '0.25rem')
      document.documentElement.style.setProperty('--radius-lg', '0.5rem')
      document.documentElement.style.setProperty('--container-4xl', '56rem')

      const TestComponent = () => {
        const { updateAccessibility } = useAccessibility()
        return <button onClick={() => updateAccessibility({ fontSizeRem: 1.5 })}>Bigger text</button>
      }

      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      )

      // On mount (fontSizeRem still 1.0), the tokens should already be
      // frozen to their rem-at-16px-baseline pixel equivalents.
      await waitFor(() => {
        expect(document.documentElement.style.getPropertyValue('--spacing')).toBe('4px')
        expect(document.documentElement.style.getPropertyValue('--radius-lg')).toBe('8px')
        expect(document.documentElement.style.getPropertyValue('--container-4xl')).toBe('896px')
      })

      // Scaling text up must NOT change the now-frozen tokens.
      fireEvent.click(screen.getByRole('button'))
      await waitFor(() => {
        expect(document.documentElement.style.fontSize).toBe('24px')
      })
      expect(document.documentElement.style.getPropertyValue('--spacing')).toBe('4px')
      expect(document.documentElement.style.getPropertyValue('--radius-lg')).toBe('8px')
      expect(document.documentElement.style.getPropertyValue('--container-4xl')).toBe('896px')
    })
  })
})
