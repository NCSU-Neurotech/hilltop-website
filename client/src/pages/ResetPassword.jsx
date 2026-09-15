import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4" aria-hidden>⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Missing reset link</h1>
        <p className="text-slate-400 text-base max-w-sm mb-6">
          This page needs a reset link from your email — you can&apos;t reach it directly.
        </p>
        <Link to="/forgot-password" className="text-[#FFD700] font-semibold hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3" aria-hidden>🎮</div>
        <h1 className="text-3xl font-black text-white tracking-tight">AssistiveGames</h1>
      </div>

      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 shadow-2xl">
        {done ? (
          <>
            <div className="text-5xl mb-4 text-center" aria-hidden>✅</div>
            <h2 className="text-xl font-bold text-white mb-2 text-center">Password updated</h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full h-14 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-lg
                         hover:bg-yellow-300 active:scale-[0.98] transition-all"
            >
              Go to sign in →
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-1">Choose a new password</h2>
            <p className="text-slate-400 text-sm mb-6">This resets the login for your whole facility.</p>

            {error && (
              <div role="alert" className="bg-red-950 border border-red-600 text-red-300 rounded-xl p-3 mb-5 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Field
                id="password" label="New password" type="password"
                value={password} onChange={setPassword}
                autoComplete="new-password" placeholder="At least 8 characters"
              />
              <Field
                id="confirmPassword" label="Confirm new password" type="password"
                value={confirmPassword} onChange={setConfirmPassword}
                autoComplete="new-password" placeholder="Re-enter password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-lg
                           hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-50
                           disabled:cursor-not-allowed transition-all mt-2"
              >
                {loading ? 'Updating…' : 'Update password →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete }) {
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
        required
        className="w-full h-14 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                   text-lg placeholder-slate-600 transition-colors
                   focus:outline-none focus:border-[#FFD700]"
      />
    </div>
  )
}
