/**
 * Music hub — /dashboard/child/:childId/music
 *
 * Two-level navigation:
 *   Level 1 — four category cards (Percussion, Keyboard & Bell, Wind, Strings)
 *   Level 2 — instruments within the chosen category
 *
 * Spacebar scanning works at both levels. In child mode a "← Back" scan item
 * is prepended to the instrument list so the child can return to categories.
 */
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  {
    id: 'percussion',
    title: 'Percussion',
    emoji: '🥁',
    color: '#ef4444',
    desc: 'Drums, mallets, and shakers',
    instrumentIds: ['drum-kit', 'percussion-mix', 'xylophone'],
  },
  {
    id: 'keyboard',
    title: 'Keyboard & Bell',
    emoji: '🎹',
    color: '#22c55e',
    desc: 'Piano, harp melody, and bright bells',
    instrumentIds: ['piano-keys', 'melody-maker', 'bell-tower'],
  },
  {
    id: 'wind',
    title: 'Wind',
    emoji: '🪈',
    color: '#38bdf8',
    desc: 'Breathy woodwinds and pipes',
    instrumentIds: ['flute', 'pan-flute'],
  },
  {
    id: 'strings',
    title: 'Strings',
    emoji: '🎻',
    color: '#ec4899',
    desc: 'Bowed warmth and deep resonance',
    instrumentIds: ['violin', 'cello'],
  },
]

const ALL_INSTRUMENTS = [
  { id: 'drum-kit',       name: 'Drum Kit',        emoji: '🥁', color: '#ef4444', desc: 'Tap the drum pads'                         },
  { id: 'percussion-mix', name: 'Percussion Wall',  emoji: '🪘', color: '#fb923c', desc: 'Cowbell, tambourine, maracas, and gong'     },
  { id: 'xylophone',      name: 'Xylophone',        emoji: '🪘', color: '#f97316', desc: 'Strike the wooden bars'                     },
  { id: 'piano-keys',     name: 'Piano Keys',       emoji: '🎹', color: '#22c55e', desc: 'Play a full octave of piano keys'           },
  { id: 'melody-maker',   name: 'Melody Maker',     emoji: '🎵', color: '#a855f7', desc: 'Tap colourful harp notes'                   },
  { id: 'bell-tower',     name: 'Bell Tower',       emoji: '🔔', color: '#fde047', desc: 'Ring bright bell tones'                     },
  { id: 'flute',          name: 'Flute',            emoji: '🪈', color: '#38bdf8', desc: 'Soft breathy flute notes'                   },
  { id: 'pan-flute',      name: 'Pan Flute',        emoji: '🪈', color: '#60a5fa', desc: 'Warm clarinet-like pipes'                   },
  { id: 'violin',         name: 'Violin',           emoji: '🎻', color: '#ec4899', desc: 'Bow bright warm string tones'               },
  { id: 'cello',          name: 'Cello',            emoji: '🎻', color: '#f472b6', desc: 'Draw deep bowed cello tones'                },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Music() {
  const { childId } = useParams()
  const navigate    = useNavigate()
  const { isChildMode, scanProfile } = useScan()

  const [activeCategoryId, setActiveCategoryId] = useState(null)

  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId) ?? null
  const visibleInstruments = activeCategory
    ? ALL_INSTRUMENTS.filter((i) => activeCategory.instrumentIds.includes(i.id))
    : null

  function openCategory(cat) { setActiveCategoryId(cat.id) }
  function backToCategories() { setActiveCategoryId(null) }
  function goTo(inst) { navigate(`/dashboard/child/${childId}/music/${inst.id}`) }

  // ── Category view ──────────────────────────────────────────────────────────
  const categoryBody = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
      {CATEGORIES.map((cat) => (
        isChildMode ? (
          <ScanItem
            key={cat.id}
            onSelect={() => openCategory(cat)}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-3xl"
          >
            <CategoryCard cat={cat} count={cat.instrumentIds.length} />
          </ScanItem>
        ) : (
          <button
            key={cat.id}
            onClick={() => openCategory(cat)}
            className="rounded-3xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
          >
            <CategoryCard cat={cat} count={cat.instrumentIds.length} />
          </button>
        )
      ))}
    </div>
  )

  // ── Instrument view ────────────────────────────────────────────────────────
  const instrumentBody = activeCategory && (
    <div className="w-full max-w-3xl">
      {/* Back row — always visible in caregiver mode; scan item in child mode */}
      {!isChildMode && (
        <button
          onClick={backToCategories}
          className="mb-6 text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1"
        >
          ← All categories
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Back button as first scan item in child mode */}
        {isChildMode && (
          <ScanItem
            onSelect={backToCategories}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-3xl"
          >
            <BackCard />
          </ScanItem>
        )}

        {visibleInstruments.map((inst) => (
          isChildMode ? (
            <ScanItem
              key={inst.id}
              onSelect={() => goTo(inst)}
              as="div"
              style={{ minWidth: 0, minHeight: 0 }}
              className="rounded-3xl"
            >
              <InstrumentCard inst={inst} />
            </ScanItem>
          ) : (
            <button
              key={inst.id}
              onClick={() => goTo(inst)}
              className="rounded-3xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
            >
              <InstrumentCard inst={inst} />
            </button>
          )
        ))}
      </div>
    </div>
  )

  // ── Page shell ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-5 flex items-center gap-4">
        {!isChildMode && (
          <Link
            to={`/dashboard/child/${childId}`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            ← Back
          </Link>
        )}
        <div className="flex-1 min-w-0">
          {activeCategory ? (
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-0.5">
                Music › {activeCategory.title}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">
                {activeCategory.emoji} {activeCategory.title}
              </h1>
              <p className="text-slate-400 text-sm mt-1">{activeCategory.desc}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none">🎵 Music</h1>
              <p className="text-slate-400 text-sm mt-1">
                Choose a family of instruments to explore.
              </p>
            </>
          )}
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-start gap-8 p-6 sm:p-10"
      >
        {isChildMode ? (
          <ScanGroup
            key={activeCategoryId ?? 'categories'}
            active
            scanSpeedMs={scanProfile.scanSpeedMs}
            highlightColor={scanProfile.scanHighlightColor}
          >
            {activeCategoryId ? instrumentBody : categoryBody}
          </ScanGroup>
        ) : (
          activeCategoryId ? instrumentBody : categoryBody
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryCard({ cat, count }) {
  return (
    <div
      className="relative flex flex-col gap-4 p-8 rounded-3xl border-2 border-transparent
                 hover:border-white/20 transition-all w-full min-h-[200px] sm:min-h-[220px]"
      style={{ backgroundColor: cat.color + '1a' }}
    >
      {/* Coloured top accent bar */}
      <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full" style={{ backgroundColor: cat.color }} />

      <span className="text-6xl leading-none" aria-hidden>{cat.emoji}</span>
      <div>
        <p className="text-white font-black text-2xl sm:text-3xl leading-tight">{cat.title}</p>
        <p className="text-slate-400 text-sm mt-1">{cat.desc}</p>
      </div>
      <p className="text-xs font-semibold mt-auto" style={{ color: cat.color }}>
        {count} instrument{count !== 1 ? 's' : ''} →
      </p>
    </div>
  )
}

function InstrumentCard({ inst }) {
  return (
    <div
      className="flex items-center gap-5 p-6 rounded-3xl border-2 border-transparent
                 hover:border-white/20 transition-all w-full"
      style={{ backgroundColor: inst.color + '22' }}
    >
      <span className="text-5xl leading-none shrink-0" aria-hidden>{inst.emoji}</span>
      <div className="min-w-0">
        <p className="text-white font-black text-lg sm:text-xl leading-tight truncate">{inst.name}</p>
        <p className="text-slate-400 text-sm mt-0.5 truncate">{inst.desc}</p>
      </div>
    </div>
  )
}

function BackCard() {
  return (
    <div
      className="flex items-center gap-4 p-6 rounded-3xl border-2 border-slate-600/50
                 hover:border-slate-500 transition-all w-full bg-slate-800/40"
    >
      <span className="text-4xl leading-none shrink-0" aria-hidden>←</span>
      <div>
        <p className="text-white font-black text-lg">All Categories</p>
        <p className="text-slate-400 text-sm mt-0.5">Go back</p>
      </div>
    </div>
  )
}
