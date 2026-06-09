/**
 * AuthContext — facility authentication state
 *
 * Wraps API calls to /api/auth/* and exposes the current facility identity
 * to all child components. Protected routes should check `isAuthenticated`.
 * Also supports demo mode (no backend required).
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEMO_FACILITY } from '../demo/demoData'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const DEMO_KEY = 'ag-demo-mode'

export function AuthProvider({ children }) {
  const [facility, setFacility] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [isDemo, setIsDemo]     = useState(false)

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
          setFacility(data)
        } else {
          sessionStorage.setItem(DEMO_KEY, '1')
          setFacility(DEMO_FACILITY)
          setIsDemo(true)
        }
      })
      .catch(() => {
        sessionStorage.setItem(DEMO_KEY, '1')
        setFacility(DEMO_FACILITY)
        setIsDemo(true)
      })
      .finally(() => setLoading(false))
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
    setIsDemo(false)
    setFacility(data)
    return data
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
    await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    setFacility(null)
  }, [isDemo])

  const value = {
    facility,
    isAuthenticated: !!facility,
    loading,
    isDemo,
    login,
    loginDemo,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
