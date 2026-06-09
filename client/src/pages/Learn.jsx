/**
 * Learn hub — /dashboard/child/:childId/learn
 *
 * 12 modules organised in three difficulty tiers.
 * In Child Mode tiles are wrapped in ScanGroup.
 */
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

const TIERS = [
  {
    label: 'Beginner — Ages 3 to 7',
    color: '#22c55e',
    modules: [
      { id: 'alphabet',   title: 'Alphabet',   emoji: '🔤', desc: 'A to Z with pictures',        color: '#3b82f6', cards: 26 },
      { id: 'numbers',    title: 'Numbers',    emoji: '🔢', desc: 'Count from 1 to 10',           color: '#22c55e', cards: 10 },
      { id: 'colors',     title: 'Colors',     emoji: '🎨', desc: 'Learn the rainbow',            color: '#ec4899', cards: 10 },
      { id: 'shapes',     title: 'Shapes',     emoji: '🔷', desc: 'Circles, squares and more',    color: '#f97316', cards: 8  },
      { id: 'animals',    title: 'Animals',    emoji: '🦁', desc: 'Meet furry friends',           color: '#84cc16', cards: 12 },
      { id: 'body-parts', title: 'Body Parts', emoji: '🧠', desc: 'Head, hands, feet and more',  color: '#06b6d4', cards: 10 },
    ],
  },
  {
    label: 'Intermediate — Ages 8 to 12',
    color: '#f59e0b',
    modules: [
      { id: 'sight-words', title: 'Sight Words', emoji: '📖', desc: 'Common reading words',      color: '#f59e0b', cards: 20 },
      { id: 'addition',    title: 'Addition',    emoji: '➕', desc: 'Simple adding up to 10',     color: '#22c55e', cards: 12 },
      { id: 'emotions',    title: 'Emotions',    emoji: '😊', desc: 'Name how you feel',          color: '#a855f7', cards: 10 },
    ],
  },
  {
    label: 'Advanced — Ages 13 to 17',
    color: '#ef4444',
    modules: [
      { id: 'science-facts',    title: 'Science Facts',    emoji: '🔬', desc: 'How the world works',       color: '#06b6d4', cards: 10 },
      { id: 'world-geography',  title: 'World Geography',  emoji: '🌍', desc: 'Continents and landmarks',  color: '#f97316', cards: 10 },
      { id: 'vocabulary',       title: 'Vocabulary',       emoji: '📝', desc: 'Words that inspire',        color: '#8b5cf6', cards: 12 },
    ],
  },
]

// Flat list of all modules for ScanGroup (child mode scans all at once)
const ALL_MODULES = TIERS.flatMap((t) => t.modules)

export default function Learn() {
  const { childId } = useParams()
  const navigate    = useNavigate()
  const { isChildMode, scanProfile } = useScan()

  function goTo(id) {
    navigate(`/dashboard/child/${childId}/learn/${id}`)
  }

  // ── Caregiver view: tier sections ────────────────────────────────────────
  const caregiverContent = (
    <div className="flex flex-col gap-10 w-full max-w-3xl">
      {TIERS.map((tier) => (
        <section key={tier.label} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold uppercase tracking-widest whitespace-nowrap"
              style={{ color: tier.color }}
            >
              {tier.label}
            </span>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {tier.modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => goTo(mod.id)}
                className="rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
              >
                <ModuleCard mod={mod} />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )

  // ── Child mode view: flat grid inside ScanGroup ───────────────────────────
  const childGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-3xl">
      {ALL_MODULES.map((mod) => (
        <ScanItem
          key={mod.id}
          onSelect={() => goTo(mod.id)}
          as="div"
          style={{ minWidth: 0, minHeight: 0 }}
          className="rounded-2xl"
        >
          <ModuleCard mod={mod} />
        </ScanItem>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Back
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">📚 Learn</h1>
          <p className="text-slate-400 text-xs mt-0.5">Flashcard learning with read-aloud</p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center p-6 sm:p-10">
        {isChildMode ? (
          <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs} highlightColor={scanProfile.scanHighlightColor}>
            {childGrid}
          </ScanGroup>
        ) : (
          caregiverContent
        )}
      </main>
    </div>
  )
}

function ModuleCard({ mod }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl
                 border-2 border-transparent hover:border-white/20 transition-all w-full"
      style={{ backgroundColor: mod.color + '22', minHeight: 130 }}
    >
      <span className="text-4xl leading-none" aria-hidden>{mod.emoji}</span>
      <div className="text-center">
        <p className="text-white font-black text-sm leading-tight">{mod.title}</p>
        <p className="text-slate-400 text-xs mt-0.5">{mod.desc}</p>
        <p className="text-slate-500 text-xs mt-0.5">{mod.cards} cards</p>
      </div>
    </div>
  )
}
