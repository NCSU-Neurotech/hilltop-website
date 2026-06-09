/**
 * Communicate — /dashboard/child/:childId/communicate
 *
 * Tab-based communication board, fully configurable per child.
 * - Preset boards (Emotions, Yes/No, Needs, Activities) are created on first
 *   visit with sensible default tiles — all removable.
 * - Caregivers can add new tabs with any name/icon, delete any tab, and
 *   add/remove tiles within each tab.
 * - Tabs are stored in localStorage (per child). Tiles are stored in DB (or
 *   localStorage in demo mode).
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { useAuth } from '../context/AuthContext'
import { useSpeech } from '../hooks/useSpeech'
import { DEMO_CHILDREN } from '../demo/demoData'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const HISTORY_MAX = 5

// ---------------------------------------------------------------------------
// Preset tile library
// ---------------------------------------------------------------------------
const LIBRARY = {
  emotions: {
    label: 'Emotions',
    tiles: [
      { icon: '😊', label: 'Happy',       bg: '#fbbf24' },
      { icon: '😢', label: 'Sad',         bg: '#60a5fa' },
      { icon: '😠', label: 'Angry',       bg: '#ef4444' },
      { icon: '😨', label: 'Scared',      bg: '#a78bfa' },
      { icon: '🤩', label: 'Excited',     bg: '#f97316' },
      { icon: '😴', label: 'Tired',       bg: '#94a3b8' },
      { icon: '🤕', label: 'In Pain',     bg: '#f43f5e' },
      { icon: '😕', label: 'Confused',    bg: '#8b5cf6' },
      { icon: '🥰', label: 'Loved',       bg: '#ec4899' },
      { icon: '😤', label: 'Frustrated',  bg: '#dc2626' },
      { icon: '😬', label: 'Nervous',     bg: '#d97706' },
      { icon: '🤒', label: 'Sick',        bg: '#65a30d' },
    ],
  },
  yesno: {
    label: 'Yes / No',
    tiles: [
      { icon: '✅', label: 'Yes',          bg: '#22c55e' },
      { icon: '❌', label: 'No',           bg: '#ef4444' },
      { icon: '🤔', label: 'Maybe',        bg: '#f59e0b' },
      { icon: '🤷', label: "I don't know", bg: '#64748b' },
      { icon: '⏸️', label: 'Wait',         bg: '#6366f1' },
      { icon: '🔁', label: 'Again',        bg: '#14b8a6' },
    ],
  },
  needs: {
    label: 'Needs',
    tiles: [
      { icon: '🍽️', label: 'Hungry',        bg: '#f97316' },
      { icon: '💧', label: 'Thirsty',       bg: '#38bdf8' },
      { icon: '🚽', label: 'Bathroom',      bg: '#a3e635' },
      { icon: '🥵', label: 'Too Hot',       bg: '#f87171' },
      { icon: '🥶', label: 'Too Cold',      bg: '#7dd3fc' },
      { icon: '🤕', label: 'Hurt',          bg: '#fb7185' },
      { icon: '💊', label: 'Medicine',      bg: '#818cf8' },
      { icon: '🛏️', label: 'Want to rest', bg: '#64748b' },
      { icon: '🧴', label: 'Need help',     bg: '#c084fc' },
    ],
  },
  activities: {
    label: 'Activities',
    tiles: [
      { icon: '🎮', label: 'Want to play',    bg: '#ef4444' },
      { icon: '🎵', label: 'Want music',      bg: '#a855f7' },
      { icon: '📖', label: 'Want a story',    bg: '#3b82f6' },
      { icon: '🚶', label: 'Want to walk',    bg: '#22c55e' },
      { icon: '🏠', label: 'Want to go home', bg: '#f59e0b' },
      { icon: '📺', label: 'Watch TV',        bg: '#06b6d4' },
      { icon: '✏️', label: 'Want to draw',    bg: '#ec4899' },
      { icon: '🧩', label: 'Puzzle time',     bg: '#8b5cf6' },
      { icon: '🍿', label: 'Snack time',      bg: '#f97316' },
      { icon: '🌳', label: 'Go outside',      bg: '#16a34a' },
    ],
  },
}
const LIBRARY_CATS = Object.keys(LIBRARY)

// Default boards created on first visit
const DEFAULT_BOARDS = [
  { id: 'emotions',    label: 'Emotions',   icon: '😊' },
  { id: 'yesno',      label: 'Yes / No',   icon: '✅' },
  { id: 'needs',      label: 'Needs',      icon: '🍽️' },
  { id: 'activities', label: 'Activities', icon: '🎮' },
]

// Default tiles per preset board
const BOARD_DEFAULTS = {
  emotions:   [
    { icon: '😊', label: 'Happy' }, { icon: '😢', label: 'Sad' },
    { icon: '😠', label: 'Angry' }, { icon: '🤕', label: 'In Pain' },
    { icon: '😨', label: 'Scared' }, { icon: '🤩', label: 'Excited' },
  ],
  yesno:      [
    { icon: '✅', label: 'Yes' }, { icon: '❌', label: 'No' }, { icon: '🤔', label: 'Maybe' },
  ],
  needs:      [
    { icon: '🍽️', label: 'Hungry' }, { icon: '💧', label: 'Thirsty' },
    { icon: '🚽', label: 'Bathroom' }, { icon: '🛏️', label: 'Want to rest' },
  ],
  activities: [
    { icon: '🎮', label: 'Want to play' },
    { icon: '📖', label: 'Want a story' },
    { icon: '🎵', label: 'Want music' },
  ],
}

// ---------------------------------------------------------------------------
// Helpers — bg color & localStorage
// ---------------------------------------------------------------------------
const CAT_FALLBACK_BG = {
  yesno: '#22c55e', emotions: '#a855f7',
  needs: '#f97316', activities: '#3b82f6',
}
function bgForTile(icon, label, boardId) {
  for (const cat of LIBRARY_CATS) {
    const found = LIBRARY[cat].tiles.find((t) => t.icon === icon && t.label === label)
    if (found) return found.bg
  }
  return CAT_FALLBACK_BG[boardId] || '#475569'
}

function boardsKey(childId) { return `ag-comm-boards-${childId}` }
function tilesKey(childId)  { return `ag-comm-tiles-${childId}` }
function seededKey(childId) { return `ag-comm-seeded-${childId}` }

function loadBoards(childId) {
  try { const v = localStorage.getItem(boardsKey(childId)); return v ? JSON.parse(v) : null }
  catch { return null }
}
function saveBoards(childId, boards) {
  try { localStorage.setItem(boardsKey(childId), JSON.stringify(boards)) } catch {}
}
function loadDemoTiles(childId) {
  try { const v = localStorage.getItem(tilesKey(childId)); return v ? JSON.parse(v) : null }
  catch { return null }
}
function saveDemoTiles(childId, tiles) {
  try { localStorage.setItem(tilesKey(childId), JSON.stringify(tiles)) } catch {}
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Communicate() {
  const { childId }  = useParams()
  const { isChildMode, scanProfile } = useScan()
  const { speak }    = useSpeech()
  const { isDemo }   = useAuth()

  const [child, setChild]               = useState(null)
  const [boards, setBoards]             = useState([])
  const [activeBoard, setActiveBoard]   = useState(null)
  const [tiles, setTiles]               = useState([])   // all tiles for this child
  const [lastSelected, setLastSelected] = useState(null)
  const [history, setHistory]           = useState([])
  const [flashId, setFlashId]           = useState(null)
  const [editMode, setEditMode]         = useState(false)
  const [showAddTab, setShowAddTab]     = useState(false)
  const [newTabIcon, setNewTabIcon]     = useState('')
  const [newTabLabel, setNewTabLabel]   = useState('')
  const [saveError, setSaveError]       = useState('')
  const flashTimer = useRef(null)

  // ── Fetch child profile ──────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) { setChild(DEMO_CHILDREN.find((c) => c.id === childId) ?? null); return }
    fetch(`${API}/api/children/${childId}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null).then(setChild).catch(() => {})
  }, [childId, isDemo])

  // ── Load boards (localStorage) ───────────────────────────────────────────
  useEffect(() => {
    const saved = loadBoards(childId)
    const initial = saved || DEFAULT_BOARDS
    if (!saved) saveBoards(childId, initial)
    setBoards(initial)
    setActiveBoard(initial[0]?.id ?? null)
  }, [childId])

  // ── Load tiles ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDemo) {
      const saved = loadDemoTiles(childId)
      if (saved !== null) { setTiles(saved); return }
      // First visit: seed all preset boards
      const defaults = Object.entries(BOARD_DEFAULTS).flatMap(([boardId, defs]) =>
        defs.map((d, i) => ({
          id: `demo-${boardId}-${i}`, icon: d.icon, label: d.label,
          boardId, order: i, bg: bgForTile(d.icon, d.label, boardId),
        }))
      )
      saveDemoTiles(childId, defaults)
      localStorage.setItem(seededKey(childId), '1')
      setTiles(defaults)
      return
    }
    fetch(`${API}/api/comm-board/${childId}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then(async (existing) => {
        if (existing.length === 0 && !localStorage.getItem(seededKey(childId))) {
          const results = await Promise.all(
            Object.entries(BOARD_DEFAULTS).flatMap(([boardId, defs]) =>
              defs.map((d, i) =>
                fetch(`${API}/api/comm-board/${childId}`, {
                  method: 'POST', credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ icon: d.icon, label: d.label, boardId, order: i }),
                }).then((r) => r.ok ? r.json() : null).catch(() => null)
              )
            )
          )
          localStorage.setItem(seededKey(childId), '1')
          setTiles(results.filter(Boolean).map((t) => ({
            ...t, bg: bgForTile(t.icon, t.label, t.boardId),
          })))
        } else {
          setTiles(existing.map((t) => ({ ...t, bg: bgForTile(t.icon, t.label, t.boardId) })))
        }
      }).catch(() => {})
  }, [childId, isDemo])

  useEffect(() => () => clearTimeout(flashTimer.current), [])

  // ── Select tile ──────────────────────────────────────────────────────────
  const handleSelect = useCallback((tile) => {
    if (editMode) return
    speak(tile.label, { rate: child?.voiceRate ?? 0.85, pitch: child?.voicePitch ?? 1.0 })
    setLastSelected(tile)
    setHistory((prev) => [tile, ...prev].slice(0, HISTORY_MAX))
    clearTimeout(flashTimer.current)
    setFlashId(tile.id)
    flashTimer.current = setTimeout(() => setFlashId(null), 800)
  }, [child, speak, editMode])

  // ── Add tile ─────────────────────────────────────────────────────────────
  async function addTile(icon, label, boardId) {
    setSaveError('')
    const order = tiles.filter((t) => t.boardId === boardId).length
    if (isDemo) {
      const tile = {
        id: `demo-${Date.now()}`, icon, label, boardId, order,
        bg: bgForTile(icon, label, boardId),
      }
      setTiles((prev) => { const next = [...prev, tile]; saveDemoTiles(childId, next); return next })
      return
    }
    try {
      const res = await fetch(`${API}/api/comm-board/${childId}`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon, label, boardId, order }),
      })
      if (!res.ok) { setSaveError('Could not add tile — check you are logged in.'); return }
      const tile = await res.json()
      setTiles((prev) => [...prev, { ...tile, bg: bgForTile(tile.icon, tile.label, tile.boardId) }])
    } catch { setSaveError('Network error — tile not saved.') }
  }

  // ── Remove tile ──────────────────────────────────────────────────────────
  async function removeTile(tileId) {
    setSaveError('')
    if (isDemo) {
      setTiles((prev) => { const next = prev.filter((t) => t.id !== tileId); saveDemoTiles(childId, next); return next })
      return
    }
    try {
      const res = await fetch(`${API}/api/comm-board/tile/${tileId}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) { setSaveError('Could not remove tile.'); return }
      setTiles((prev) => prev.filter((t) => t.id !== tileId))
    } catch { setSaveError('Network error — tile not removed.') }
  }

  // ── Add board (tab) ──────────────────────────────────────────────────────
  function addBoard() {
    if (!newTabIcon.trim() || !newTabLabel.trim()) return
    const id = `custom-${Date.now()}`
    const board = { id, label: newTabLabel.trim(), icon: newTabIcon.trim() }
    const next = [...boards, board]
    setBoards(next)
    saveBoards(childId, next)
    setActiveBoard(id)
    setNewTabIcon('')
    setNewTabLabel('')
    setShowAddTab(false)
  }

  // ── Delete board (tab) + its tiles ───────────────────────────────────────
  async function deleteBoard(boardId) {
    if (!window.confirm(`Delete this tab and all its tiles? This cannot be undone.`)) return
    setSaveError('')
    const boardTiles = tiles.filter((t) => t.boardId === boardId)

    if (isDemo) {
      const next = tiles.filter((t) => t.boardId !== boardId)
      setTiles(next)
      saveDemoTiles(childId, next)
    } else {
      await Promise.all(boardTiles.map((t) =>
        fetch(`${API}/api/comm-board/tile/${t.id}`, { method: 'DELETE', credentials: 'include' })
          .catch(() => {})
      ))
      setTiles((prev) => prev.filter((t) => t.boardId !== boardId))
    }

    const nextBoards = boards.filter((b) => b.id !== boardId)
    setBoards(nextBoards)
    saveBoards(childId, nextBoards)
    if (activeBoard === boardId) setActiveBoard(nextBoards[0]?.id ?? null)
  }

  // ── Render ───────────────────────────────────────────────────────────────
  const color       = child?.scanHighlightColor || scanProfile.scanHighlightColor || '#FFD700'
  const activeTiles = tiles.filter((t) => t.boardId === activeBoard)
  const addedKeys   = new Set(activeTiles.map((t) => `${t.icon}::${t.label}`))

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">

      {/* Header */}
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Back
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-lg font-black text-white leading-none">Communication Board</h1>
          {child && <p className="text-slate-400 text-xs mt-0.5">{child.firstName}</p>}
        </div>
        {!isChildMode && (
          <button
            onClick={() => { setEditMode((e) => !e); setShowAddTab(false); setSaveError('') }}
            className={`px-4 h-9 rounded-xl text-sm font-bold transition-all ${
              editMode
                ? 'bg-[#FFD700] text-[#0f172a]'
                : 'bg-[#1e293b] border border-slate-600 text-slate-300 hover:border-slate-400'
            }`}
          >
            {editMode ? '✓ Done' : '✏️ Edit board'}
          </button>
        )}
      </header>

      <div id="main-content" className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-5 gap-4">

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {boards.map((board) => {
            const active = activeBoard === board.id
            return (
              <div key={board.id} className="relative flex-shrink-0">
                <button
                  onClick={() => setActiveBoard(board.id)}
                  className={`flex items-center gap-1.5 h-10 rounded-xl text-sm font-bold
                              transition-all pr-4 pl-3 ${active
                    ? 'bg-[#FFD700] text-[#0f172a]'
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'
                  } ${editMode ? 'pr-7' : ''}`}
                >
                  <span aria-hidden>{board.icon}</span>
                  {board.label}
                </button>
                {editMode && (
                  <button
                    onClick={() => deleteBoard(board.id)}
                    aria-label={`Delete ${board.label} tab`}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white
                               text-xs font-black flex items-center justify-center leading-none
                               hover:bg-red-500 transition-colors shadow z-10"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}

          {/* Add tab button / form */}
          {editMode && !showAddTab && (
            <button
              onClick={() => setShowAddTab(true)}
              className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-bold
                         border-2 border-dashed border-slate-600 text-slate-400
                         hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
            >
              + New tab
            </button>
          )}

          {editMode && showAddTab && (
            <div className="flex items-center gap-2 bg-[#1e293b] rounded-xl border border-slate-600 px-3 py-1.5">
              <input
                value={newTabIcon}
                onChange={(e) => setNewTabIcon(e.target.value)}
                placeholder="🎨"
                maxLength={4}
                autoFocus
                className="w-12 h-8 bg-transparent text-white text-center text-lg
                           focus:outline-none border-b border-slate-600 focus:border-[#FFD700]"
              />
              <input
                value={newTabLabel}
                onChange={(e) => setNewTabLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBoard()}
                placeholder="Tab name"
                className="w-36 h-8 bg-transparent text-white text-sm
                           focus:outline-none border-b border-slate-600 focus:border-[#FFD700]
                           placeholder-slate-600"
              />
              <button
                onClick={addBoard}
                disabled={!newTabIcon.trim() || !newTabLabel.trim()}
                className="px-3 h-8 rounded-lg bg-[#FFD700] text-[#0f172a] text-sm font-bold
                           hover:bg-yellow-300 disabled:opacity-40 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setShowAddTab(false); setNewTabIcon(''); setNewTabLabel('') }}
                className="text-slate-500 hover:text-slate-300 text-lg font-bold leading-none"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {saveError && (
          <div className="px-4 py-2.5 rounded-xl bg-red-950 border border-red-800
                          text-red-300 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span className="flex-1">{saveError}</span>
            <button onClick={() => setSaveError('')}
              className="text-red-400 hover:text-red-200 font-bold text-lg leading-none">×</button>
          </div>
        )}

        {/* Last said + history (hidden in edit mode) */}
        {!editMode && <LastSelectedBanner lastSelected={lastSelected} color={color} />}
        {!editMode && history.length > 0 && <HistoryStrip history={history} />}

        {/* Edit mode hint */}
        {editMode && (
          <p className="text-slate-400 text-sm text-center">
            Tap <strong className="text-white">×</strong> on a tile to remove it ·
            Use the panel below to add tiles to this tab
          </p>
        )}

        {/* Tile grid */}
        {activeTiles.length === 0 && !editMode ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-7xl">💬</span>
            <p className="text-white font-bold text-lg">No tiles on this board yet</p>
            <p className="text-slate-400 text-sm">Tap "Edit board" to add tiles.</p>
          </div>
        ) : (
          <TileGrid
            tiles={activeTiles}
            isChildMode={isChildMode}
            editMode={editMode}
            scanSpeedMs={scanProfile.scanSpeedMs}
            highlightColor={color}
            flashId={flashId}
            onSelect={handleSelect}
            onRemove={removeTile}
          />
        )}

        {/* Add tiles panel (edit mode only) */}
        {editMode && activeBoard && (
          <AddTilesPanel
            boardId={activeBoard}
            addedKeys={addedKeys}
            onAdd={(icon, label, cat) => addTile(icon, label, activeBoard)}
          />
        )}

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tile grid
// ---------------------------------------------------------------------------
function TileGrid({ tiles, isChildMode, editMode, scanSpeedMs, highlightColor, flashId, onSelect, onRemove }) {
  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {tiles.map((tile) =>
        isChildMode && !editMode ? (
          <ScanItem key={tile.id} onSelect={() => onSelect(tile)} as="div"
            style={{ minWidth: 0, minHeight: 0 }} className="rounded-2xl cursor-pointer">
            <CommTile tile={tile} flash={flashId === tile.id} />
          </ScanItem>
        ) : (
          <div key={tile.id} className="relative">
            <button
              onClick={() => !editMode && onSelect(tile)}
              disabled={editMode}
              className="rounded-2xl text-left w-full focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-[#FFD700]"
            >
              <CommTile tile={tile} flash={flashId === tile.id} />
            </button>
            {editMode && (
              <button
                onClick={() => onRemove(tile.id)}
                aria-label={`Remove ${tile.label}`}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 text-white
                           font-black flex items-center justify-center text-base leading-none
                           hover:bg-red-500 transition-colors shadow-lg z-10"
              >
                ×
              </button>
            )}
          </div>
        )
      )}
    </div>
  )

  return (isChildMode && !editMode) ? (
    <ScanGroup active scanSpeedMs={scanSpeedMs} highlightColor={highlightColor}>
      {grid}
    </ScanGroup>
  ) : grid
}

// ---------------------------------------------------------------------------
// Individual tile
// ---------------------------------------------------------------------------
function CommTile({ tile, flash }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                  transition-all select-none w-full
                  ${flash ? 'scale-105 brightness-125' : 'hover:scale-[1.03]'}`}
      style={{
        backgroundColor: tile.bg + (flash ? 'ff' : '33'),
        border: `2px solid ${tile.bg + (flash ? 'ff' : '55')}`,
        minHeight: 120,
      }}
    >
      <span className="text-5xl leading-none" aria-hidden>{tile.icon}</span>
      <span className="font-black text-center leading-tight text-[#f8fafc]" style={{ fontSize: 20 }}>
        {tile.label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Add tiles panel
// ---------------------------------------------------------------------------
function AddTilesPanel({ boardId, addedKeys, onAdd }) {
  const [activeCategory, setActiveCategory] = useState(LIBRARY_CATS[0])
  const [customIcon,  setCustomIcon]  = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [adding, setAdding]           = useState(null)

  async function handleAddPreset(tile) {
    setAdding(tile.label)
    await onAdd(tile.icon, tile.label, activeCategory)
    setAdding(null)
  }

  async function handleAddCustom() {
    if (!customIcon.trim() || !customLabel.trim()) return
    setAdding('__custom__')
    await onAdd(customIcon.trim(), customLabel.trim(), 'custom')
    setAdding(null)
    setCustomIcon('')
    setCustomLabel('')
  }

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-slate-700/60 p-5 space-y-4">
      <h3 className="text-white font-bold text-base">Add tiles to this tab</h3>

      {/* Category selector */}
      <div className="flex gap-2 flex-wrap">
        {LIBRARY_CATS.map((cat) => (
          <button key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 h-8 rounded-lg text-sm font-semibold transition-colors ${
              activeCategory === cat
                ? 'bg-[#FFD700] text-[#0f172a]'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            {LIBRARY[cat].label}
          </button>
        ))}
        <button
          onClick={() => setActiveCategory('__custom__')}
          className={`px-3 h-8 rounded-lg text-sm font-semibold transition-colors ${
            activeCategory === '__custom__'
              ? 'bg-[#FFD700] text-[#0f172a]'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
          }`}
        >
          + Custom tile
        </button>
      </div>

      {/* Preset grid */}
      {activeCategory !== '__custom__' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {LIBRARY[activeCategory].tiles.map((tile) => {
            const key     = `${tile.icon}::${tile.label}`
            const isAdded = addedKeys.has(key)
            return (
              <button key={key}
                onClick={() => !isAdded && !adding && handleAddPreset(tile)}
                disabled={isAdded || !!adding}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm
                            font-semibold transition-all text-left ${
                  isAdded
                    ? 'border-slate-700/30 bg-slate-800/30 text-slate-600 cursor-default'
                    : adding === tile.label
                      ? 'border-[#FFD700]/50 bg-[#FFD700]/10 text-[#FFD700] cursor-wait'
                      : 'border-slate-600 bg-[#0f172a] text-slate-200 hover:border-[#FFD700] hover:text-[#FFD700]'
                }`}
              >
                <span className="text-xl flex-shrink-0">{tile.icon}</span>
                <span className="leading-tight">
                  {isAdded ? `${tile.label} ✓` : adding === tile.label ? 'Adding…' : tile.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Custom tile form */}
      {activeCategory === '__custom__' && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            value={customIcon}
            onChange={(e) => setCustomIcon(e.target.value)}
            placeholder="🙂"
            maxLength={4}
            className="w-20 h-11 px-3 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                       text-center text-xl focus:outline-none focus:border-[#FFD700] transition-colors"
          />
          <input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder='Label (e.g. "I want a hug")'
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            className="flex-1 h-11 px-4 rounded-xl bg-[#0f172a] border-2 border-slate-600 text-white
                       text-base placeholder-slate-600 focus:outline-none focus:border-[#FFD700] transition-colors"
          />
          <button
            onClick={handleAddCustom}
            disabled={!customIcon.trim() || !customLabel.trim() || !!adding}
            className="px-5 h-11 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-sm
                       hover:bg-yellow-300 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {adding === '__custom__' ? 'Adding…' : '+ Add'}
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Last selected banner
// ---------------------------------------------------------------------------
function LastSelectedBanner({ lastSelected, color }) {
  if (!lastSelected) {
    return (
      <div className="rounded-2xl bg-[#1e293b] border-2 border-slate-700/60 p-5 text-center">
        <p className="text-slate-500 text-lg">Nothing selected yet — start scanning!</p>
      </div>
    )
  }
  return (
    <div
      role="status" aria-live="assertive" aria-atomic="true"
      className="rounded-2xl p-5 flex items-center justify-center gap-4 transition-all"
      style={{ backgroundColor: color + '22', border: `3px solid ${color}` }}
    >
      <span className="text-6xl leading-none" aria-hidden>{lastSelected.icon}</span>
      <div>
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wide">Last said</p>
        <p className="text-white font-black" style={{ fontSize: 32, lineHeight: 1.1 }}>
          {lastSelected.label}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// History strip
// ---------------------------------------------------------------------------
function HistoryStrip({ history }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide flex-shrink-0">
        History:
      </span>
      {history.map((item, i) => (
        <div key={i}
          className="flex items-center gap-1.5 px-3 h-8 rounded-full bg-[#1e293b]
                     border border-slate-700 text-sm text-slate-300">
          <span aria-hidden>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
