/**
 * ChildHub — per-child activity hub (/dashboard/child/:childId)
 *
 * The main screen a child sees. Five category tiles (Games, Learn, Stories,
 * Music, Communicate), a mode toggle, and the scan engine integrated via
 * ScanGroup / ScanItem.
 *
 * Caregiver mode:  normal mouse + keyboard, mode toggle button visible.
 * Child mode:      ScanGroup active, thick colored border around viewport,
 *                  mode toggle hidden — only Escape can exit.
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { useAuth } from '../context/AuthContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'
import { AVATARS } from '../components/ChildModal'
import { DEMO_CHILDREN } from '../demo/demoData'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const AVATAR_MAP = Object.fromEntries(AVATARS.map(({ id, emoji }) => [id, emoji]))

// ---------------------------------------------------------------------------
// Category tiles
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: 'games',       label: 'Games',       emoji: '🎮', color: '#ef4444', desc: 'Play fun games' },
  { id: 'learn',       label: 'Learn',       emoji: '📚', color: '#22c55e', desc: 'Letters, numbers & more' },
  { id: 'stories',     label: 'Stories',     emoji: '📖', color: '#3b82f6', desc: 'Books & adventures' },
  { id: 'music',       label: 'Music',       emoji: '🎵', color: '#a855f7', desc: 'Play instruments' },
  { id: 'communicate', label: 'Communicate', emoji: '💬', color: '#f97316', desc: 'Say what you need' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChildHub() {
  const { childId } = useParams()
  const navigate    = useNavigate()
  const { isChildMode, scanProfile, enterChildMode, exitChildMode } = useScan()
  const { isDemo } = useAuth()

  const [child, setChild]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch child profile (or use demo data)
  useEffect(() => {
    if (isDemo) {
      const found = DEMO_CHILDREN.find((c) => c.id === childId)
      if (!found) { navigate('/dashboard', { replace: true }); return }
      setChild(found)
      setLoading(false)
      return
    }
    fetch(`${API}/api/children/${childId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) { navigate('/dashboard', { replace: true }); return }
        setChild(data)
      })
      .catch(() => navigate('/dashboard', { replace: true }))
      .finally(() => setLoading(false))
  }, [childId, navigate, isDemo])

  // NOTE: We intentionally do NOT exit child mode on unmount.
  // Child mode is a session-level state that persists across all sub-pages
  // (Games, Learn, Stories, etc.). The global escape handler in App.jsx
  // is the only exit path while in child mode.

  const handleEnterChildMode = useCallback(() => {
    enterChildMode(child)
  }, [enterChildMode, child])

  if (loading) return <LoadingScreen />
  if (!child) return null

  const avatar = AVATAR_MAP[child.avatarId] ?? '🧒'
  const color  = child.scanHighlightColor || '#FFD700'

  return (
    <div
      className="min-h-screen bg-[#0f172a] flex flex-col transition-all"
      style={isChildMode ? {
        // Thick colored border signals Child Mode to caregivers watching
        outline: `6px solid ${color}`,
        outlineOffset: '-6px',
      } : {}}
    >
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4
                         flex items-center justify-between flex-shrink-0">
        {/* Left: back + child identity */}
        <div className="flex items-center gap-4">
          {!isChildMode && (
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
            >
              ← Back
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: color + '33' }}
            >
              {avatar}
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none">{child.firstName}</p>
              <p className="text-slate-400 text-xs leading-none mt-0.5">
                {isChildMode ? '🟢 Child Mode' : 'Caregiver Mode'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: mode toggle now handled by the top-right global button */}
        {!isChildMode ? null : (
          <div className="text-slate-500 text-xs">Press Esc to exit</div>
        )}
      </header>

      {/* ── Category grid ─────────────────────────────────────── */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {isChildMode ? (
          // Declarative scanning — ScanGroup manages the cycle automatically
          <ScanGroup
            active={isChildMode}
            scanSpeedMs={scanProfile.scanSpeedMs}
            highlightColor={scanProfile.scanHighlightColor}
          >
            <CategoryGrid childId={childId} isChildMode={isChildMode} />
          </ScanGroup>
        ) : (
          <CategoryGrid childId={childId} isChildMode={false} />
        )}

        {!isChildMode && (
          <section className="w-full max-w-4xl mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Shared activities
                </span>
                <p className="text-slate-500 text-sm mt-1">
                  Launch a group story session or a two-device game directly from the hub.
                </p>
              </div>
              <span className="text-slate-500 text-xs">Caregiver only</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate(`/dashboard/child/${childId}/storytime`)}
                className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[#1e293b] border-2 border-slate-700/60 hover:border-white/20 transition-all"
              >
                <div className="text-left">
                  <p className="text-white font-black text-base">Group Storytime</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Share a 4-digit code so listeners can follow along on another device.
                  </p>
                </div>
                <span className="text-4xl">🎭</span>
              </button>
              <button
                onClick={() => navigate(`/dashboard/child/${childId}/games/online`)}
                className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[#1e293b] border-2 border-slate-700/60 hover:border-white/20 transition-all"
              >
                <div className="text-left">
                  <p className="text-white font-black text-base">Online Pong</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Start a two-person game and share the room code with another device.
                  </p>
                </div>
                <span className="text-4xl">🏓</span>
              </button>
            </div>
          </section>
        )}
        {isChildMode && (
          <p className="text-slate-600 text-sm mt-8">
            Spacebar to select · Esc to exit child mode
          </p>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Category grid (used in both modes — inside ScanGroup in child mode)
// ---------------------------------------------------------------------------

function CategoryGrid({ childId, isChildMode }) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl">
      {CATEGORIES.map((cat) => {
        const destination = `/dashboard/child/${childId}/${cat.id}`

        return isChildMode ? (
          // In child mode: ScanItem wraps each tile for auto-scanning
          <ScanItem
            key={cat.id}
            onSelect={() => navigate(destination)}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-2xl"
          >
            <CategoryTile cat={cat} isChildMode />
          </ScanItem>
        ) : (
          // In caregiver mode: plain link, no scanning
          <button
            key={cat.id}
            onClick={() => navigate(destination)}
            className="rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
          >
            <CategoryTile cat={cat} />
          </button>
        )
      })}
    </div>
  )
}

function CategoryTile({ cat, isChildMode }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl
                 border-2 border-transparent transition-all w-full
                 hover:border-white/20 hover:scale-[1.02]"
      style={{
        backgroundColor: cat.color + '22',
        minHeight: isChildMode ? 180 : 160,
      }}
    >
      <span className="text-5xl" aria-hidden>{cat.emoji}</span>
      <div className="text-center">
        <p className="text-white font-black text-lg leading-tight">{cat.label}</p>
        <p className="text-slate-400 text-xs mt-0.5">{cat.desc}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  )
}
