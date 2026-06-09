/**
 * Home — public marketing homepage (/)
 *
 * Audience: facility administrators deciding whether to adopt the platform.
 * Tone: warm, trustworthy, professional — not childish, but colorful.
 *
 * Sections:
 *   1. Navbar
 *   2. Hero
 *   3. Feature highlights (5 modules)
 *   4. How it works (3 steps)
 *   5. Why AssistiveGames (trust pillars)
 *   6. Final CTA
 *   7. Footer
 */
import { Link } from 'react-router-dom'

const CONTACT = 'neurotech-org@ncsu.edu'

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="bg-[#0f172a] text-white min-h-screen font-[Nunito,system-ui,sans-serif]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhySection />
      <CtaSection />
      <Footer />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0f172a]/90 backdrop-blur-md
                    border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden>🎮</span>
          <span className="text-lg font-black tracking-tight">AssistiveGames</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white text-sm font-semibold transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-4 h-9 rounded-lg bg-[#FFD700] text-[#0f172a] text-sm font-black
                       hover:bg-yellow-300 transition-colors flex items-center"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,215,0,0.08) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="max-w-4xl mx-auto relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD700]/10
                        border border-[#FFD700]/30 text-[#FFD700] text-sm font-bold mb-8">
          <span aria-hidden>♿</span>
          Built for single-switch adaptive access
        </div>

        <h1 className="text-5xl sm:text-6xl font-black leading-[1.05] mb-6 tracking-tight">
          Accessible play for{' '}
          <span
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            every child
          </span>
        </h1>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          AssistiveGames gives children with physical disabilities the tools to play,
          learn, communicate, and create — using just a single adaptive switch mapped
          to the spacebar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 h-14 rounded-xl bg-[#FFD700] text-[#0f172a]
                       font-black text-lg hover:bg-yellow-300 active:scale-[0.98]
                       transition-all flex items-center justify-center gap-2"
          >
            Get started for your facility
            <span aria-hidden>→</span>
          </Link>
          <a
            href={`mailto:${CONTACT}`}
            className="w-full sm:w-auto px-8 h-14 rounded-xl bg-[#1e293b] text-slate-200
                       font-bold text-base hover:bg-[#293548] active:scale-[0.98]
                       transition-all flex items-center justify-center gap-2
                       border border-slate-700"
          >
            <span aria-hidden>✉️</span>
            Contact us
          </a>
        </div>

        {/* Hero stats */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
          {[
            { value: '5+',  label: 'Activity modules' },
            { value: '1',   label: 'Switch required' },
            { value: '3–18',label: 'Age range' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black text-[#FFD700]">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Feature highlights
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    emoji: '🎮',
    color: '#ef4444',
    title: 'Games',
    body: 'Solo and multiplayer games designed from the ground up for single-switch play — no complex controls, just joy and engagement.',
  },
  {
    emoji: '📚',
    color: '#22c55e',
    title: 'Learning',
    body: 'Curriculum-aligned modules for ages 3–18. Colors, shapes, phonics, math, and more — all scan-navigable with instant positive feedback.',
  },
  {
    emoji: '📖',
    color: '#3b82f6',
    title: 'Stories',
    body: 'Read-aloud books with Web Speech narration and choose-your-own-adventure tales. Progress is saved per child.',
  },
  {
    emoji: '🎵',
    color: '#a855f7',
    title: 'Music',
    body: 'A drum kit, melody maker, and beat builder — each instrument designed so any child can make real music with a single press.',
  },
  {
    emoji: '💬',
    color: '#f97316',
    title: 'Communicate',
    body: 'Customizable AAC boards with preset categories (Emotions, Needs, Yes/No) and a custom tile builder. Every selection is spoken aloud.',
  },
]

function Features() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Everything in one place</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Five fully integrated modules, each designed to the same accessibility standard.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ emoji, color, title, body }) {
  return (
    <div
      className="rounded-2xl p-6 border border-slate-800 hover:border-slate-600
                 transition-all hover:translate-y-[-2px]"
      style={{ background: `linear-gradient(135deg, ${color}0d 0%, #1e293b 100%)` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ backgroundColor: color + '22' }}
      >
        {emoji}
      </div>
      <h3 className="text-lg font-black mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// How it works
// ---------------------------------------------------------------------------

const STEPS = [
  {
    num: '01',
    title: 'Request access',
    body: 'Fill out a short form describing your facility and needs. We\'ll reach out within 2 business days.',
    color: '#FFD700',
  },
  {
    num: '02',
    title: 'We set up your account',
    body: 'Our team configures your facility account. You add child profiles with personalised scan speed, highlight colour, and preferences.',
    color: '#22c55e',
  },
  {
    num: '03',
    title: 'Children start playing',
    body: 'Tap "Enter Child Mode" and hand over the device. The scan engine activates and everything is spacebar-only from that point.',
    color: '#3b82f6',
  },
]

function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-[#0a0f1e]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Up and running in minutes</h2>
          <p className="text-slate-400 text-lg">No app installs. Works on any modern browser.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-[calc(100%+1px)] w-8
                                border-t-2 border-dashed border-slate-700" aria-hidden />
              )}
              <div
                className="text-4xl font-black mb-4"
                style={{ color: step.color }}
              >
                {step.num}
              </div>
              <h3 className="text-lg font-black mb-2">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Why AssistiveGames
// ---------------------------------------------------------------------------

const PILLARS = [
  {
    icon: '⚡',
    title: 'Truly single-switch',
    body: 'Every interaction — games, learning, stories, music, communication — requires only one input. No mouse, no touchscreen precision required.',
  },
  {
    icon: '👤',
    title: 'Per-child profiles',
    body: 'Each child has a personalised profile: scan speed (300ms–3s), highlight colour, voice settings, and preferred activities.',
  },
  {
    icon: '🌐',
    title: 'Web-based, zero install',
    body: 'Runs in any modern browser on tablets, laptops, or desktops. No app store, no installation, no updates to manage.',
  },
  {
    icon: '♿',
    title: 'WCAG AA+ accessible',
    body: 'High-contrast UI, 80px+ touch targets, no time pressure in educational modules, and full reduced-motion support.',
  },
  {
    icon: '🔒',
    title: 'Secure & private',
    body: 'Facility-scoped accounts with JWT authentication. Child data never leaves your facility\'s account.',
  },
  {
    icon: '💬',
    title: 'AAC communication built in',
    body: 'The communication board is a first-class feature, not an afterthought. Preset boards + fully custom tiles per child.',
  },
]

function WhySection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Designed with purpose
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Built specifically for care facilities — not retrofitted from a general-purpose platform.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map(({ icon, title, body }) => (
            <div key={title}
              className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/60
                         hover:border-slate-600 transition-all">
              <div className="text-3xl mb-3" aria-hidden>{icon}</div>
              <h3 className="text-base font-black mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Final CTA
// ---------------------------------------------------------------------------

function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="rounded-3xl p-10 sm:p-14 border border-[#FFD700]/20"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(255,215,0,0.07) 0%, #1e293b 100%)',
          }}
        >
          <div className="text-5xl mb-6" aria-hidden>🎮</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Request access for your facility today. We&apos;ll have you set up and
            ready within 2 business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 h-14 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-lg
                         hover:bg-yellow-300 active:scale-[0.98] transition-all
                         flex items-center justify-center gap-2"
            >
              Request facility access <span aria-hidden>→</span>
            </Link>
            <Link
              to="/login"
              className="px-8 h-14 rounded-xl bg-slate-700 text-white font-bold text-base
                         hover:bg-slate-600 active:scale-[0.98] transition-all
                         flex items-center justify-center border border-slate-600"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="border-t border-slate-800 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center
                      justify-between gap-4 text-slate-500 text-sm">
        <div className="flex items-center gap-2">
          <span aria-hidden>🎮</span>
          <span className="font-bold text-slate-400">AssistiveGames</span>
          <span>· Built by Neurotech @ NC State</span>
        </div>
        <div className="flex items-center gap-6">
          <a href={`mailto:${CONTACT}`}
            className="hover:text-slate-300 transition-colors">
            {CONTACT}
          </a>
          <Link to="/login" className="hover:text-slate-300 transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="hover:text-slate-300 transition-colors">
            Get access
          </Link>
        </div>
      </div>
    </footer>
  )
}
