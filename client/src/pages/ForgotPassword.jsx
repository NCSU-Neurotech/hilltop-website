import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const { requestPasswordReset } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3" aria-hidden>🎮</div>
        <h1 className="text-3xl font-black text-white tracking-tight">AssistiveGames</h1>
      </div>

      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 shadow-2xl">
        {submitted ? (
          <>
            <div className="text-5xl mb-4 text-center" aria-hidden>📬</div>
            <h2 className="text-xl font-bold text-white mb-2 text-center">Check your email</h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              If <strong className="text-slate-300">{email}</strong> has an account, we&apos;ve sent
              a link to reset the password. It expires in 30 minutes.
            </p>
            <Link
              to="/login"
              className="block w-full h-14 leading-[56px] text-center rounded-xl bg-[#FFD700]
                         text-[#0f172a] font-black text-lg hover:bg-yellow-300 active:scale-[0.98]
                         transition-all"
            >
              ← Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-white mb-1">Reset your password</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter your facility&apos;s login email and we&apos;ll send a reset link.
            </p>

            {error && (
              <div role="alert" className="bg-red-950 border border-red-600 text-red-300 rounded-xl p-3 mb-5 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@facility.org"
                  required
                  className="w-full h-14 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                             text-lg placeholder-slate-600 transition-colors
                             focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-lg
                           hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-50
                           disabled:cursor-not-allowed transition-all mt-2"
              >
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              <Link to="/login" className="text-[#FFD700] font-semibold hover:underline">
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
