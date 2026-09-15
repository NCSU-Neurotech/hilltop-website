/**
 * Regression test: a fresh visitor with no session cookie gets a 401 from
 * /api/auth/me. That must show the real login screen, not silently enroll
 * them in demo mode — this exact bug shipped to production once already
 * (any first-time visitor landed straight in the demo dashboard).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

function Probe() {
  const { isAuthenticated, isDemo, loading } = useAuth()
  if (loading) return <div>loading</div>
  return (
    <div>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="demo">{String(isDemo)}</div>
    </div>
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  sessionStorage.clear()
})

describe('AuthProvider — initial session check', () => {
  it('does not enter demo mode on a 401 (not logged in)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false })))

    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('false'))
    expect(screen.getByTestId('demo')).toHaveTextContent('false')
    expect(sessionStorage.getItem('ag-demo-mode')).toBeNull()
  })

  it('sets the real facility on a successful session check', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ facility: { id: 'f1', name: 'Test Home', email: 'a@b.org' } }) })
    ))

    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('authenticated')).toHaveTextContent('true'))
    expect(screen.getByTestId('demo')).toHaveTextContent('false')
  })

  it('falls back to demo mode only when the backend is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))))

    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('demo')).toHaveTextContent('true'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
  })
})
