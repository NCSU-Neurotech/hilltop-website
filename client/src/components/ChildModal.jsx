/**
 * ChildModal — Add / Edit child profile
 *
 * Props:
 *   child        — existing child object (edit mode) or null (add mode)
 *   onSave(child) — called with the saved child from the API
 *   onDelete(id)  — called after successful delete (edit mode only)
 *   onClose()    — close without saving
 */
import { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ---------------------------------------------------------------------------
// Data constants
// ---------------------------------------------------------------------------

export const AVATARS = [
  { id: 'bear',     emoji: '🐻' },
  { id: 'cat',      emoji: '🐱' },
  { id: 'dog',      emoji: '🐶' },
  { id: 'rabbit',   emoji: '🐰' },
  { id: 'fox',      emoji: '🦊' },
  { id: 'panda',    emoji: '🐼' },
  { id: 'owl',      emoji: '🦉' },
  { id: 'penguin',  emoji: '🐧' },
  { id: 'lion',     emoji: '🦁' },
  { id: 'elephant', emoji: '🐘' },
  { id: 'turtle',   emoji: '🐢' },
  { id: 'dragon',   emoji: '🐉' },
]

export const HIGHLIGHT_COLORS = [
  { value: '#FFD700', label: 'Gold'   },
  { value: '#ef4444', label: 'Red'    },
  { value: '#22c55e', label: 'Green'  },
  { value: '#3b82f6', label: 'Blue'   },
  { value: '#a855f7', label: 'Purple' },
  { value: '#f97316', label: 'Orange' },
  { value: '#06b6d4', label: 'Cyan'   },
  { value: '#ec4899', label: 'Pink'   },
  { value: '#ffffff', label: 'White'  },
]

const SPEED_PRESETS = [
  { label: 'Very Slow', ms: 2000 },
  { label: 'Slow',      ms: 1500 },
  { label: 'Medium',    ms: 1200 },
  { label: 'Fast',      ms: 800  },
  { label: 'Very Fast', ms: 500  },
]

const DEFAULT_FORM = {
  firstName: '',
  age: '',
  avatarId: 'bear',
  scanHighlightColor: '#FFD700',
  scanSpeedMs: 1200,
  voiceRate: 0.85,
  voicePitch: 1.0,
  notes: '',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChildModal({ child, onSave, onDelete, onClose }) {
  const isEditing = Boolean(child?.id)
  const [form, setForm]               = useState(DEFAULT_FORM)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const [confirmDelete, setConfirm]   = useState(false)
  const [error, setError]             = useState('')
  const firstFieldRef                 = useRef(null)

  // Populate form when editing
  useEffect(() => {
    if (child) {
      setForm({
        firstName:          child.firstName          ?? '',
        age:                child.age                ?? '',
        avatarId:           child.avatarId           ?? 'bear',
        scanHighlightColor: child.scanHighlightColor ?? '#FFD700',
        scanSpeedMs:        child.scanSpeedMs        ?? 1200,
        voiceRate:          child.voiceRate          ?? 0.85,
        voicePitch:         child.voicePitch         ?? 1.0,
        notes:              child.notes              ?? '',
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    // Focus first field on open
    setTimeout(() => firstFieldRef.current?.focus(), 50)
  }, [child])

  // Close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field) {
    return (val) => setForm((f) => ({ ...f, [field]: val }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    if (!form.firstName.trim()) return setError('First name is required.')
    if (!form.age || Number(form.age) < 1 || Number(form.age) > 25)
      return setError('Age must be between 1 and 25.')

    setSaving(true)
    try {
      const payload = { ...form, age: Number(form.age) }
      const url    = isEditing ? `${API}/api/children/${child.id}` : `${API}/api/children`
      const method = isEditing ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Save failed')
      }
      const saved = await res.json()
      onSave(saved)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`${API}/api/children/${child.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Delete failed')
      onDelete(child.id)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? `Edit ${child.firstName}` : 'Add child profile'}
    >
      <div className="w-full max-w-lg bg-[#1e293b] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-700/60 flex-shrink-0">
          <h2 className="text-xl font-black text-white">
            {isEditing ? `Edit ${child.firstName}` : 'Add Child Profile'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400
                       hover:bg-slate-700 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* ── Scrollable form body ── */}
        <form onSubmit={handleSave} noValidate className="overflow-y-auto px-6 py-5 space-y-6 flex-1">

          {error && (
            <div role="alert" className="bg-red-950 border border-red-600 text-red-300 rounded-xl p-3 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="firstName" className="block text-sm font-semibold text-slate-300 mb-1.5">
                First name <span className="text-red-400">*</span>
              </label>
              <input
                ref={firstFieldRef}
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={(e) => set('firstName')(e.target.value)}
                placeholder="Alex"
                required
                className="w-full h-12 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                           text-base placeholder-slate-600 focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="age" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Age <span className="text-red-400">*</span>
              </label>
              <input
                id="age"
                type="number"
                min={1} max={25}
                value={form.age}
                onChange={(e) => set('age')(e.target.value)}
                placeholder="8"
                required
                className="w-full h-12 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                           text-base placeholder-slate-600 focus:outline-none focus:border-[#FFD700] transition-colors"
              />
            </div>
          </div>

          {/* Avatar picker */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">Avatar</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(({ id, emoji }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => set('avatarId')(id)}
                  aria-label={id}
                  aria-pressed={form.avatarId === id}
                  className={`h-12 rounded-xl text-2xl flex items-center justify-center transition-all
                    ${form.avatarId === id
                      ? 'bg-[#FFD700]/20 border-2 border-[#FFD700] scale-110'
                      : 'bg-[#0f172a] border-2 border-slate-700 hover:border-slate-500'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Highlight color */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">
              Scan highlight color
              <span
                className="inline-block w-4 h-4 rounded-full ml-2 align-middle border border-slate-600"
                style={{ backgroundColor: form.scanHighlightColor }}
              />
            </p>
            <div className="flex flex-wrap gap-2">
              {HIGHLIGHT_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('scanHighlightColor')(value)}
                  aria-label={label}
                  aria-pressed={form.scanHighlightColor === value}
                  className={`w-9 h-9 rounded-full border-[3px] transition-all
                    ${form.scanHighlightColor === value
                      ? 'border-white scale-125'
                      : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: value }}
                />
              ))}
            </div>
          </div>

          {/* Scan speed */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-2">
              Scan speed — <span className="text-[#FFD700]">{form.scanSpeedMs} ms</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {SPEED_PRESETS.map(({ label, ms }) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => set('scanSpeedMs')(ms)}
                  className={`px-3 h-9 rounded-lg text-sm font-semibold transition-all
                    ${form.scanSpeedMs === ms
                      ? 'bg-[#FFD700] text-[#0f172a]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={300} max={3000} step={50}
              value={form.scanSpeedMs}
              onChange={(e) => set('scanSpeedMs')(Number(e.target.value))}
              aria-label="Scan speed in milliseconds"
              className="w-full accent-[#FFD700]"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Fast (300ms)</span>
              <span>Slow (3000ms)</span>
            </div>
          </div>

          {/* Voice settings */}
          <div className="grid grid-cols-2 gap-4">
            <SliderField
              label="Voice speed"
              value={form.voiceRate}
              onChange={set('voiceRate')}
              min={0.5} max={1.5} step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
            />
            <SliderField
              label="Voice pitch"
              value={form.voicePitch}
              onChange={set('voicePitch')}
              min={0.5} max={2.0} step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-slate-300 mb-1.5">
              Caregiver notes <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set('notes')(e.target.value)}
              rows={3}
              placeholder="Any notes about this child's preferences or needs…"
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                         text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-[#FFD700] transition-colors"
            />
          </div>
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-700/60 flex items-center gap-3 flex-shrink-0">
          {isEditing && !confirmDelete && (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="px-4 h-11 rounded-xl bg-red-950 text-red-400 text-sm font-semibold
                         hover:bg-red-900 transition-colors border border-red-800"
            >
              Delete
            </button>
          )}
          {confirmDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 h-11 rounded-xl bg-red-600 text-white text-sm font-bold
                         hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Deleting…' : 'Confirm delete'}
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-xl bg-slate-700 text-slate-200 text-sm font-semibold
                       hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 h-11 rounded-xl bg-[#FFD700] text-[#0f172a] text-sm font-black
                       hover:bg-yellow-300 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add child'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Slider helper
// ---------------------------------------------------------------------------

function SliderField({ label, value, onChange, min, max, step, format }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-300 mb-1">
        {label} — <span className="text-[#FFD700]">{format(value)}</span>
      </p>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-[#FFD700]"
      />
    </div>
  )
}
