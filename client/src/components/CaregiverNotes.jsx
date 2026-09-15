/**
 * CaregiverNotes — Display + manage caregiver notes for a child
 *
 * Shows recent pinned notes, an add button, and a "View all" modal with
 * pin/unpin and delete. Integrates with /api/children/:id/caregiver-notes
 * endpoints in real mode; falls back to localStorage (keyed per child) in
 * demo mode so the whole feature is usable without a backend running, same
 * pattern as Settings.jsx. Notes aren't attributed to an individual
 * caregiver — this app has one shared login per facility, not per-person
 * accounts.
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DEMO_SEED_NOTES = [
  { id: '1', content: 'Great progress today!', isPinned: true, createdAt: new Date().toISOString() },
  { id: '2', content: 'Enjoyed music session', isPinned: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
]

export function CaregiverNotes({ childId, limit = 3 }) {
  const { isDemo } = useAuth()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAllModal, setShowAllModal] = useState(false)

  const demoNotesKey = `demo-notes-${childId}`

  useEffect(() => {
    if (isDemo) {
      try {
        const saved = JSON.parse(localStorage.getItem(demoNotesKey))
        setNotes(Array.isArray(saved) ? saved : DEMO_SEED_NOTES)
      } catch {
        setNotes(DEMO_SEED_NOTES)
      }
      setLoading(false)
      return
    }

    fetch(`${API}/api/children/${childId}/caregiver-notes`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setNotes(data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [childId, isDemo])

  const persistDemo = (next) => {
    localStorage.setItem(demoNotesKey, JSON.stringify(next))
  }

  const handleAdded = (newNote) => {
    setNotes((prev) => {
      const next = [newNote, ...prev]
      if (isDemo) persistDemo(next)
      return next
    })
    setShowAddModal(false)
  }

  const handleTogglePin = async (note) => {
    const nextPinned = !note.isPinned

    if (isDemo) {
      setNotes((prev) => {
        const next = prev.map((n) => (n.id === note.id ? { ...n, isPinned: nextPinned } : n))
        persistDemo(next)
        return next
      })
      return
    }

    try {
      const res = await fetch(`${API}/api/children/${childId}/caregiver-notes/${note.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: nextPinned }),
      })
      if (res.ok) {
        const updated = await res.json()
        setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)))
      }
    } catch {
      // Leave the list as-is; the caregiver can retry.
    }
  }

  const handleDelete = async (note) => {
    if (!confirm('Delete this note?')) return

    if (isDemo) {
      setNotes((prev) => {
        const next = prev.filter((n) => n.id !== note.id)
        persistDemo(next)
        return next
      })
      return
    }

    try {
      const res = await fetch(`${API}/api/children/${childId}/caregiver-notes/${note.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== note.id))
      }
    } catch {
      // Leave the list as-is; the caregiver can retry.
    }
  }

  if (loading) return null

  // Pinned notes first, matching the API's/demo intent.
  const ordered = [...notes].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1))
  const preview = ordered.slice(0, limit)

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/60 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-lg">📝 Caregiver Notes</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 h-8 rounded-lg bg-[#FFD700] text-[#0f172a] font-semibold text-xs hover:bg-yellow-300 transition-all"
        >
          + Add Note
        </button>
      </div>

      {preview.length === 0 ? (
        <p className="text-slate-400 text-sm">No notes yet. Start documenting!</p>
      ) : (
        <div className="space-y-2">
          {preview.map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <button
          onClick={() => setShowAllModal(true)}
          className="text-[#FFD700] text-sm font-semibold hover:underline"
        >
          View all notes ({notes.length}) →
        </button>
      )}

      {showAddModal && (
        <AddNoteModal
          childId={childId}
          isDemo={isDemo}
          onClose={() => setShowAddModal(false)}
          onAdded={handleAdded}
        />
      )}

      {showAllModal && (
        <AllNotesModal
          notes={ordered}
          onClose={() => setShowAllModal(false)}
          onTogglePin={handleTogglePin}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function NoteRow({ note }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3 flex gap-2">
      {note.isPinned && <span className="text-amber-400">📌</span>}
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm break-words">{note.content}</p>
        <p className="text-slate-500 text-xs mt-1">
          {new Date(note.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

function AllNotesModal({ notes, onClose, onTogglePin, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h3 className="text-white font-black text-lg">All Notes</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold"
          >
            Close
          </button>
        </div>
        <div className="space-y-2 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-slate-400 text-sm">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-slate-800/40 rounded-lg p-3 flex gap-2 items-start">
                {note.isPinned && <span className="text-amber-400 flex-shrink-0">📌</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm break-words">{note.content}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => onTogglePin(note)}
                    className="px-2 h-7 rounded bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600"
                  >
                    {note.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => onDelete(note)}
                    className="px-2 h-7 rounded bg-red-900/50 text-red-300 text-xs font-semibold hover:bg-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function AddNoteModal({ childId, isDemo, onClose, onAdded }) {
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) return

    setSaving(true)
    setError('')

    if (isDemo) {
      onAdded({
        id: `demo-${Date.now()}`,
        content: content.trim(),
        isPinned: false,
        createdAt: new Date().toISOString(),
      })
      setSaving(false)
      return
    }

    try {
      const res = await fetch(`${API}/api/children/${childId}/caregiver-notes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        onAdded(await res.json())
      } else {
        setError('Failed to save note')
      }
    } catch {
      setError('Failed to save note — check your connection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] rounded-2xl p-6 w-96 max-w-full">
        <h3 className="text-white font-black mb-4">Add Note</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What would you like to note?"
          className="w-full h-32 bg-slate-800 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD700] resize-none"
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        <div className="flex gap-2 mt-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-lg bg-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !content.trim()}
            className="px-4 h-10 rounded-lg bg-[#FFD700] text-[#0f172a] font-semibold text-sm hover:bg-yellow-300 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
