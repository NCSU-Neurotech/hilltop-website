/**
 * AuthContext — Single shared login per facility
 *
 * One facility = one email/password. There is no individual caregiver
 * identity, no roster, no roles — whoever is logged in has full access.
 * Token payload: { facilityId }. Demo mode still supported via sessionStorage.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEMO_FACILITY } from '../demo/demoData'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const DEMO_KEY = 'ag-demo-mode'

export function AuthProvider({ children }) {
  const [facility, setFacility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  // On mount: check demo flag, then real session, then fall back to demo
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_KEY) === '1') {
      setFacility(DEMO_FACILITY)
      setIsDemo(true)
      setLoading(false)
      return
    }

    fetch(`${API}/api/auth/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setFacility(data.facility)
        } else {
          // Fallback to demo mode
          sessionStorage.setItem(DEMO_KEY, '1')
          setFacility(DEMO_FACILITY)
          setIsDemo(true)
        }
      })
      .catch(() => {
        // Fallback on error — enable demo mode for local testing
        // This allows testing full UI without backend
        sessionStorage.setItem(DEMO_KEY, '1')
        setFacility(DEMO_FACILITY)
        setIsDemo(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const signup = useCallback(async (facilityName, email, password) => {
    const res = await fetch(`${API}/api/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityName, email, password }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Signup failed')
    }

    const data = await res.json()
    sessionStorage.removeItem(DEMO_KEY)
    setFacility(data.facility)
    setIsDemo(false)
    return data
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Login failed')
    }

    const data = await res.json()
    sessionStorage.removeItem(DEMO_KEY)
    setFacility(data.facility)
    setIsDemo(false)
    return data
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    const res = await fetch(`${API}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Failed to request password reset')
    }

    return res.json()
  }, [])

  const resetPassword = useCallback(async (token, password) => {
    const res = await fetch(`${API}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || 'Failed to reset password')
    }

    return res.json()
  }, [])

  const loginDemo = useCallback(() => {
    sessionStorage.setItem(DEMO_KEY, '1')
    setFacility(DEMO_FACILITY)
    setIsDemo(true)
  }, [])

  const logout = useCallback(async () => {
    if (isDemo) {
      sessionStorage.removeItem(DEMO_KEY)
      setFacility(null)
      setIsDemo(false)
      return
    }

    try {
      await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch {}

    setFacility(null)
  }, [isDemo])

  const isAuthenticated = !!facility

  const value = {
    facility,
    isAuthenticated,
    loading,
    isDemo,
    login,
    signup,
    loginDemo,
    logout,
    requestPasswordReset,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
