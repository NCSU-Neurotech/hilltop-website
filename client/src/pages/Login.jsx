import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const { login, loginDemo, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Already authenticated — bounce straight to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, authLoading, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return <Spinner />

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3" aria-hidden>🎮</div>
        <h1 className="text-3xl font-black text-white tracking-tight">AssistiveGames</h1>
        <p className="text-slate-400 mt-1 text-base">Accessible play for every child</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Facility sign in</h2>
        <p className="text-slate-400 text-sm mb-6">Caregiver portal — mouse &amp; keyboard</p>

        {error && (
          <div role="alert" className="bg-red-950 border border-red-600 text-red-300 rounded-xl p-3 mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field
            id="email" label="Email address" type="email"
            value={email} onChange={setEmail}
            autoComplete="email" placeholder="you@facility.org"
            required
          />
          <Field
            id="password" label="Password" type="password"
            value={password} onChange={setPassword}
            autoComplete="current-password" placeholder="••••••••"
            required
          />

          <p className="text-right -mt-2">
            <Link to="/forgot-password" className="text-sm text-slate-400 hover:text-[#FFD700] transition-colors">
              Forgot password?
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-lg
                       hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-50
                       disabled:cursor-not-allowed transition-all mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#1e293b] px-3 text-slate-500 text-sm">or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { loginDemo(); navigate('/dashboard', { replace: true }) }}
          className="w-full h-14 rounded-xl border-2 border-slate-600 text-white font-bold text-base
                     hover:border-slate-400 hover:bg-slate-700/40 active:scale-[0.98] transition-all"
        >
          Try Demo — no account needed
        </button>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[#FFD700] font-semibold hover:underline">
            Request facility access
          </Link>
        </p>
      </div>

      <p className="text-slate-600 text-xs mt-8">
        Questions?{' '}
        <a href="mailto:neurotech-org@ncsu.edu" className="hover:text-slate-400 transition-colors">
          neurotech-org@ncsu.edu
        </a>
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared sub-components (local to this file)
// ---------------------------------------------------------------------------

function Field({ id, label, type, value, onChange, placeholder, autoComplete, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full h-14 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                   text-lg placeholder-slate-600 transition-colors
                   focus:outline-none focus:border-[#FFD700]"
      />
    </div>
  )
}

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  )
}
