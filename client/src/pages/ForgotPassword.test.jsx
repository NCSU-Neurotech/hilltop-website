import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ForgotPassword from './ForgotPassword'

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ForgotPassword />
      </AuthProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url) => {
    if (String(url).includes('/api/auth/me')) {
      return Promise.resolve({ ok: false })
    }
    if (String(url).includes('/api/auth/forgot-password')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'not found' }) })
  }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ForgotPassword', () => {
  it('shows a generic confirmation after submitting an email', async () => {
    renderPage()

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'home@facility.org' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/home@facility.org/)).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (String(url).includes('/api/auth/me')) return Promise.resolve({ ok: false })
      return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Too many reset requests. Please try again later.' }) })
    }))

    renderPage()

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'home@facility.org' } })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/too many reset requests/i)
    })
  })
})
