/**
 * Games hub — /dashboard/child/:childId/games
 *
 * 10 single-switch (spacebar-only) solo games.
 * Multiplayer section visible to caregivers only — networked games use separate devices.
 */
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

const SOLO_GAMES = [
  { id: 'sky-jumper',     name: 'Sky Jumper',     emoji: '🦅', desc: 'Tap to flap over obstacles',              color: '#3b82f6' },
  { id: 'star-catcher',   name: 'Star Catcher',   emoji: '⭐', desc: 'Flip the basket to catch falling stars',   color: '#FFD700' },
  { id: 'bubble-pop',     name: 'Bubble Pop',      emoji: '🫧', desc: 'Press when the bubble is highlighted',    color: '#22c55e' },
  { id: 'color-match',    name: 'Color Match',     emoji: '🎨', desc: 'Press when the color matches the target (more challenging)', color: '#ec4899' },
  { id: 'whack-a-mole',   name: 'Whack-a-Mole',   emoji: '🐹', desc: 'Press when the mole pops up',             color: '#f59e0b' },
  { id: 'balloon-float',  name: 'Balloon Float',   emoji: '🎈', desc: 'Keep the balloon floating with taps',     color: '#f97316' },
  { id: 'fishing-game',   name: 'Fishing',         emoji: '🎣', desc: 'Press to catch the highlighted fish',     color: '#06b6d4' },
  { id: 'rocket-launch',  name: 'Rocket Launch',   emoji: '🚀', desc: 'Press in the green zone to launch',       color: '#a855f7' },
  { id: 'painter-game',   name: 'Painter',         emoji: '🎨', desc: 'Press to paint — create your own art!',   color: '#e879f9' },
  { id: 'memory-match',   name: 'Memory Match',    emoji: '🃏', desc: 'Find the matching pairs of cards (challenging)',        color: '#14b8a6' },
]

const MULTI_GAMES = [
  { id: 'online', name: 'Online Pong', emoji: '🏓', desc: 'Cross-device Pong via room code — SPACE reverses your paddle', color: '#a855f7', badge: 'Networked' },
]

export default function Games() {
  const { childId } = useParams()
  const navigate    = useNavigate()
  const { isChildMode, scanProfile, enterChildMode, activeChild } = useScan()

  function goTo(id) { navigate(`/dashboard/child/${childId}/games/${id}`) }

  const soloGrid = (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 w-full max-w-5xl">
      {SOLO_GAMES.map((game) =>
        isChildMode ? (
          <ScanItem
            key={game.id}
            onSelect={() => goTo(game.id)}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-2xl"
          >
            <GameCard game={game} />
          </ScanItem>
        ) : (
          <button
            key={game.id}
            onClick={() => goTo(game.id)}
            className="rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
          >
            <GameCard game={game} />
          </button>
        )
      )}
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
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-white leading-none">🎮 Games</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Press spacebar to play. Bubble Pop, Whack-a-Mole, Balloon Float, Fishing and Rocket Launch are lower-demand choices; Memory Match is more complex.
          </p>
        </div>
        {!isChildMode ? null : (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center p-6 sm:p-10 gap-10">
        {/* ── Solo games ──────────────────────────────── */}
        <section className="w-full flex flex-col items-center gap-4 max-w-5xl">
          <SectionLabel label="Solo — Spacebar only" />
          {isChildMode ? (
            <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs} highlightColor={scanProfile.scanHighlightColor}>
              {soloGrid}
            </ScanGroup>
          ) : (
            soloGrid
          )}
        </section>

        {/* ── Multiplayer (caregiver only) ─────────────── */}
        {!isChildMode && (
          <section className="w-full flex flex-col items-center gap-4 max-w-5xl">
            <SectionLabel label="Multiplayer — separate devices" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-lg">
              {MULTI_GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => goTo(game.id)}
                  className="rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
                >
                  <MultiCard game={game} />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function SectionLabel({ label }) {
  return (
    <div className="w-full flex items-center gap-3">
      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-700/60" />
    </div>
  )
}

function GameCard({ game }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl
                 border-2 border-transparent hover:border-white/20 transition-all w-full"
      style={{ backgroundColor: game.color + '22', minHeight: 180 }}
    >
      <span className="text-5xl leading-none" aria-hidden>{game.emoji}</span>
      <div className="text-center">
        <p className="text-white font-black text-base leading-tight">{game.name}</p>
        <p className="text-slate-400 text-xs mt-1">{game.desc}</p>
      </div>
    </div>
  )
}

function MultiCard({ game }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl
                 border-2 border-transparent hover:border-white/20 transition-all w-full"
      style={{ backgroundColor: game.color + '22', minHeight: 180 }}
    >
      <span className="text-5xl leading-none" aria-hidden>{game.emoji}</span>
      <div className="text-center">
        <p className="text-white font-black text-base leading-tight">{game.name}</p>
        <p className="text-slate-400 text-xs mt-1">{game.desc}</p>
      </div>
      <span
        className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full border"
        style={{ color: game.color, borderColor: game.color + '66', backgroundColor: game.color + '22' }}
      >
        {game.badge}
      </span>
    </div>
  )
}
