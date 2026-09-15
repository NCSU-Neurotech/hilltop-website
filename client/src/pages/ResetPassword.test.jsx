import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ResetPassword from './ResetPassword'

function renderPage(initialEntry = '/reset-password?token=abc123') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <ResetPassword />
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url) => {
    if (String(url).includes('/api/auth/me')) return Promise.resolve({ ok: false })
    if (String(url).includes('/api/auth/reset-password')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'not found' }) })
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ResetPassword', () => {
  it('prompts for a new reset link when no token is present', async () => {
    renderPage('/reset-password')
    expect(await screen.findByText(/missing reset link/i)).toBeInTheDocument()
  })

  it('rejects mismatched passwords without calling the API', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'different123' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i)
  })

  it('submits the token and new password, then shows success', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText(/password updated/i)).toBeInTheDocument()
    })

    const resetCall = fetch.mock.calls.find(([url]) => String(url).includes('/api/auth/reset-password'))
    expect(resetCall).toBeTruthy()
    const body = JSON.parse(resetCall[1].body)
    expect(body).toEqual({ token: 'abc123', password: 'password123' })
  })

  it('shows the server error when the token is invalid or expired', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (String(url).includes('/api/auth/me')) return Promise.resolve({ ok: false })
      return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'This reset link is invalid or has expired' }) })
    }))

    renderPage()

    fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid or has expired/i)
    })
  })
})
