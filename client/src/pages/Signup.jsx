/**
 * Signup — Facility access request
 *
 * Per spec: not self-serve. Composes a formatted contact email to
 * neurotech-org@ncsu.edu via a mailto: link. After the user sends the email,
 * they see a confirmation message with expected timeline.
 *
 * There is no account-creation path anywhere in this UI — the real signup
 * endpoint (server/routes/auth.js POST /api/auth/signup) is only ever
 * called by the team directly once a request here has been reviewed. The
 * "How it works" steps below exist specifically to make that explicit up
 * front, so nobody arrives expecting an instant self-serve account.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'neurotech-org@ncsu.edu'

const ROLES = [
  'Caregiver / Direct support',
  'Facility administrator',
  'Occupational therapist',
  'Special education teacher',
  'Other',
]

const STEPS = [
  { emoji: '✉️', title: 'You send a request', desc: 'Fill out the short form below — it opens an email to our team, nothing is created yet.' },
  { emoji: '🔎', title: 'We review it', desc: 'Our team reads every request and reaches out within 2 business days.' },
  { emoji: '⚙️', title: 'We set up your facility', desc: 'We configure your account together — scan speed, categories, and accessibility defaults from day one.' },
  { emoji: '🔑', title: 'You get your login', desc: 'We email your facility\'s login directly. That\'s the first time an account exists.' },
]

export default function Signup() {
  const [form, setForm] = useState({
    facilityName: '',
    contactName: '',
    role: '',
    phone: '',
    email: '',
    description: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const subject = encodeURIComponent(
      `AssistiveGames Access Request — ${form.facilityName}`
    )
    const body = encodeURIComponent(
      [
        `Facility name:  ${form.facilityName}`,
        `Contact name:   ${form.contactName}`,
        `Role:           ${form.role}`,
        `Phone:          ${form.phone || '(not provided)'}`,
        `Email:          ${form.email}`,
        ``,
        `About their needs:`,
        form.description,
      ].join('\n')
    )

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  if (submitted) return <Confirmation email={form.email} />

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center p-4 py-16">
      {/* Brand */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3" aria-hidden>🎮</div>
        <h1 className="text-3xl font-black text-white tracking-tight">AssistiveGames</h1>
        <p className="text-slate-400 mt-1 text-base">Request access for your facility</p>
      </div>

      {/* How it works — explicit, up front: this is a contact form, not a
          signup form. No account exists until step 4. */}
      <div className="w-full max-w-3xl mb-8">
        <p className="text-center text-slate-400 text-sm mb-5 max-w-xl mx-auto">
          AssistiveGames accounts aren&apos;t self-serve — every facility is set up
          directly by our team, so we can walk through setup with you rather than
          leave you to configure it alone.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center gap-2 p-4 rounded-2xl
                         bg-[#1e293b] border border-slate-700/60"
            >
              <span
                className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#FFD700] text-[#0f172a]
                           text-xs font-black flex items-center justify-center"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="text-3xl" aria-hidden>{step.emoji}</span>
              <p className="text-white font-bold text-xs leading-tight">{step.title}</p>
              <p className="text-slate-500 text-xs leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-lg bg-[#1e293b] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Step 1: Facility access request</h2>
        <p className="text-slate-400 text-sm mb-6">
          We&apos;ll review this and reach out within{' '}
          <strong className="text-slate-300">2 business days</strong> — nothing is
          created automatically when you submit.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field
            id="facilityName" label="Facility name" required
            value={form.facilityName} onChange={set('facilityName')}
            placeholder="Sunrise Care Center"
          />
          <Field
            id="contactName" label="Your name" required
            value={form.contactName} onChange={set('contactName')}
            placeholder="Jane Smith"
          />

          {/* Role select */}
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-slate-300 mb-1.5">
              Your role <span className="text-red-400">*</span>
            </label>
            <select
              id="role"
              value={form.role}
              onChange={set('role')}
              required
              className="w-full h-14 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                         text-base focus:outline-none focus:border-[#FFD700] transition-colors
                         appearance-none cursor-pointer"
            >
              <option value="" disabled>Select your role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field
              id="phone" label="Phone (optional)"
              value={form.phone} onChange={set('phone')}
              type="tel" placeholder="(555) 000-0000"
            />
            <Field
              id="email" label="Email" required
              value={form.email} onChange={set('email')}
              type="email" placeholder="you@facility.org"
            />
          </div>
          <p className="text-slate-500 text-xs -mt-2">
            This becomes your facility&apos;s login email once your account is set up.
          </p>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-1.5">
              Brief description of your needs <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={set('description')}
              required
              rows={4}
              placeholder="e.g. We support 12 children ages 4–16 with physical disabilities. We currently use adaptive switches and need an accessible platform for games and communication boards…"
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white text-base
                         placeholder-slate-600 resize-none focus:outline-none focus:border-[#FFD700] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-lg
                       hover:bg-yellow-300 active:scale-[0.98] transition-all mt-2"
          >
            Send request →
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-5">
          This will open your email client with a pre-filled message to{' '}
          <span className="text-slate-400">{CONTACT_EMAIL}</span> — sending it does not create an account.
        </p>

        <p className="text-center text-slate-400 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#FFD700] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Confirmation screen
// ---------------------------------------------------------------------------

function Confirmation({ email }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 text-center">
      <div className="text-7xl mb-6" aria-hidden>📬</div>
      <h1 className="text-3xl font-black text-white mb-3">Request sent!</h1>
      <p className="text-slate-300 text-lg max-w-md mb-2">
        Your email client should have opened with a pre-filled message to{' '}
        <strong className="text-[#FFD700]">{CONTACT_EMAIL}</strong>.
      </p>
      <p className="text-slate-400 text-base max-w-sm mb-6">
        If the email didn&apos;t open, please email us directly and mention{' '}
        <strong className="text-slate-300">AssistiveGames</strong> in the subject line.
      </p>

      {/* Reiterate what happens next — same framing as the pre-submit page,
          so the "nothing exists yet" expectation stays consistent. */}
      <div className="w-full max-w-sm bg-[#1e293b] rounded-2xl p-5 mb-8 text-left space-y-3">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-1">
          What happens next
        </p>
        <Step n={2} text="Our team reviews your request within 2 business days." />
        <Step n={3} text="We set up your facility's account together." />
        <Step n={4} text={<>We email your login to <strong className="text-white">{email || 'you'}</strong>.</>} />
      </div>

      <Link
        to="/login"
        className="inline-block px-8 h-14 leading-[56px] rounded-xl bg-[#1e293b] text-white
                   font-bold hover:bg-[#293548] transition-colors border border-slate-600"
      >
        ← Back to sign in
      </Link>
    </div>
  )
}

function Step({ n, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFD700] text-[#0f172a] text-xs font-black flex items-center justify-center">
        {n}
      </span>
      <p className="text-slate-300 text-sm">{text}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reusable field
// ---------------------------------------------------------------------------

function Field({ id, label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-14 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                   text-base placeholder-slate-600 focus:outline-none focus:border-[#FFD700]
                   transition-colors"
      />
    </div>
  )
}
