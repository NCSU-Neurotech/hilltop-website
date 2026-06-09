/**
 * Dashboard — Profile selector (/dashboard)
 *
 * Authenticated landing page. Shows all child profiles for this facility
 * and lets caregivers add, edit, and delete profiles via a modal.
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChildCard from '../components/ChildCard'
import ChildModal from '../components/ChildModal'
import { DEMO_CHILDREN } from '../demo/demoData'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Dashboard() {
  const { facility, logout, isDemo } = useAuth()
  const navigate = useNavigate()

  const [children, setChildren]     = useState([])
  const [loading, setLoading]       = useState(true)
  // null → modal closed | {} → adding | {…child} → editing
  const [modalChild, setModalChild] = useState(null)

  const fetchChildren = useCallback(() => {
    if (isDemo) {
      setChildren(DEMO_CHILDREN)
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`${API}/api/children`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setChildren)
      .catch(() => setChildren([]))
      .finally(() => setLoading(false))
  }, [isDemo])

  useEffect(() => { fetchChildren() }, [fetchChildren])

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  // Called by ChildModal after a successful save (POST or PATCH)
  function handleSaved(saved) {
    setChildren((prev) => {
      const exists = prev.find((c) => c.id === saved.id)
      return exists
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved]
    })
    setModalChild(null)
  }

  // Called by ChildModal after a successful delete
  function handleDeleted(id) {
    setChildren((prev) => prev.filter((c) => c.id !== id))
    setModalChild(null)
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">

      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4
                         flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>🎮</span>
          <div>
            <p className="text-lg font-black text-white leading-none">AssistiveGames</p>
            <p className="text-slate-400 text-sm leading-none mt-0.5">{facility?.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 h-10 rounded-lg bg-slate-700 text-slate-200 text-sm font-semibold
                     hover:bg-slate-600 active:scale-[0.97] transition-all"
        >
          Sign out
        </button>
      </header>

      {/* ── Demo banner ───────────────────────────────────────── */}
      {isDemo && (
        <div className="bg-[#FFD700]/10 border-b border-[#FFD700]/30 px-6 py-2 text-center">
          <p className="text-[#FFD700] text-sm font-semibold">
            Demo Mode — sample data only. Sign in with a real account to save profiles.
          </p>
        </div>
      )}

      {/* ── Main ──────────────────────────────────────────────── */}
      <main id="main-content" className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Child Profiles</h1>
            <p className="text-slate-400 text-sm mt-1">
              Select a child to enter their hub, or manage profiles below.
            </p>
          </div>
          <button
            onClick={() => setModalChild({})}
            className="flex items-center gap-2 px-5 h-12 rounded-xl bg-[#FFD700]
                       text-[#0f172a] font-bold text-base hover:bg-yellow-300
                       active:scale-[0.97] transition-all"
          >
            <span className="text-xl leading-none" aria-hidden>+</span>
            Add Child
          </button>
        </div>

        {loading ? (
          <ChildGridSkeleton />
        ) : children.length === 0 ? (
          <EmptyState onAdd={() => setModalChild({})} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onClick={() => navigate(`/dashboard/child/${child.id}`)}
                onEdit={() => setModalChild(child)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {modalChild !== null && (
        <ChildModal
          child={Object.keys(modalChild).length > 0 ? modalChild : null}
          onSave={handleSaved}
          onDelete={handleDeleted}
          onClose={() => setModalChild(null)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-7xl mb-6" aria-hidden>🧒</div>
      <h2 className="text-xl font-bold text-white mb-2">No child profiles yet</h2>
      <p className="text-slate-400 max-w-xs text-base leading-relaxed mb-8">
        Add your first child profile to get started. You can configure their
        scan speed, highlight color, and preferred activities.
      </p>
      <button
        onClick={onAdd}
        className="px-6 h-12 rounded-xl bg-[#FFD700] text-[#0f172a] font-bold hover:bg-yellow-300
                   active:scale-[0.97] transition-all"
      >
        + Add first child
      </button>
    </div>
  )
}

function ChildGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#1e293b] rounded-2xl min-h-[140px] animate-pulse" />
      ))}
    </div>
  )
}
