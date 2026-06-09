/**
 * Reaction Race (same-screen) — /dashboard/child/:childId/games/reaction-race
 *
 * A signal flashes; first player to press their key wins the round.
 * Best of ROUNDS_TO_WIN rounds wins the match.
 *
 *   Player 1 — SPACEBAR
 *   Player 2 — ENTER
 *
 * Pressing before the flash → "Too Early!" penalty (point to opponent).
 *
 * Phases: waiting → get-ready → flash → result → gameover
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const ROUNDS_TO_WIN = 3        // best of 5 (first to 3)
const READY_MS_MIN  = 1800     // minimum delay before flash
const READY_MS_MAX  = 4500     // maximum delay before flash
const RESULT_MS     = 1800     // how long to show round result
const FLASH_COLOR   = '#22c55e'
const TOO_EARLY_COLOR = '#ef4444'

function rng(min, max) { return min + Math.random() * (max - min) }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReactionRace() {
  const { childId } = useParams()

  // React state for display only — actual game logic in ref
  const [score, setScore]         = useState({ p1: 0, p2: 0 })
  const [phase, setPhase]         = useState('waiting')  // waiting|get-ready|flash|result|gameover
  const [roundMsg, setRoundMsg]   = useState('')
  const [flashOn, setFlashOn]     = useState(false)
  const [winner, setWinner]       = useState(null)

  const gameRef = useRef({
    phase:    'waiting',
    s1:       0,
    s2:       0,
    winner:   null,
    flashTimer: null,
    resultTimer: null,
    flashing:  false,
  })

  // ── Cleanup on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      const g = gameRef.current
      clearTimeout(g.flashTimer)
      clearTimeout(g.resultTimer)
    }
  }, [])

  // ── Core functions ────────────────────────────────────
  function startRound() {
    const g = gameRef.current
    g.phase    = 'get-ready'
    g.flashing = false
    setFlashOn(false)
    setPhase('get-ready')
    setRoundMsg('')

    const delay = rng(READY_MS_MIN, READY_MS_MAX)
    g.flashTimer = setTimeout(() => {
      if (g.phase !== 'get-ready') return
      g.phase    = 'flash'
      g.flashing = true
      setFlashOn(true)
      setPhase('flash')
    }, delay)
  }

  function endRound(p1Won, tooEarly = false) {
    const g = gameRef.current
    clearTimeout(g.flashTimer)
    clearTimeout(g.resultTimer)
    g.phase    = 'result'
    g.flashing = false
    setFlashOn(false)
    setPhase('result')

    let msg = ''
    if (tooEarly) {
      msg = p1Won ? '⚡ P2 Too Early! Point to P1' : '⚡ P1 Too Early! Point to P2'
    } else {
      msg = p1Won ? '🏅 Player 1 wins the round!' : '🏅 Player 2 wins the round!'
    }

    if (p1Won) { g.s1++; setScore({ p1: g.s1, p2: g.s2 }) }
    else        { g.s2++; setScore({ p1: g.s1, p2: g.s2 }) }

    setRoundMsg(msg)

    if (g.s1 >= ROUNDS_TO_WIN || g.s2 >= ROUNDS_TO_WIN) {
      const w = g.s1 >= ROUNDS_TO_WIN ? 1 : 2
      g.winner = w; g.phase = 'gameover'
      setWinner(w); setPhase('gameover')
    } else {
      g.resultTimer = setTimeout(() => startRound(), RESULT_MS)
    }
  }

  function resetMatch() {
    const g = gameRef.current
    clearTimeout(g.flashTimer); clearTimeout(g.resultTimer)
    g.s1 = 0; g.s2 = 0; g.winner = null; g.phase = 'waiting'
    g.flashing = false
    setScore({ p1: 0, p2: 0 }); setWinner(null)
    setRoundMsg(''); setFlashOn(false); setPhase('waiting')
  }

  // ── Keydown handler ───────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      const isSpace = e.code === 'Space'
      const isEnter = e.code === 'Enter'
      if (!isSpace && !isEnter) return
      e.preventDefault()

      const g = gameRef.current

      if (g.phase === 'waiting') {
        startRound(); return
      }
      if (g.phase === 'get-ready') {
        // Pressed before flash — too early!
        endRound(!isSpace, true)  // if p1 pressed too early, p2 wins (p1Won = false)
        return
      }
      if (g.phase === 'flash') {
        // Valid press — first press wins
        endRound(isSpace)   // p1Won if spacebar
        return
      }
      if (g.phase === 'gameover') {
        resetMatch(); return
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────
  const bgColor = flashOn ? FLASH_COLOR : '#0f172a'

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-75"
      style={{ backgroundColor: bgColor }}
    >
      <header
        className="border-b px-6 py-4 flex items-center gap-4 transition-colors duration-75"
        style={{
          backgroundColor: flashOn ? FLASH_COLOR + 'cc' : '#1e293b',
          borderColor:     flashOn ? 'rgba(255,255,255,0.3)' : 'rgb(51 65 85 / 0.6)',
        }}
      >
        <Link to={`/dashboard/child/${childId}/games`}
          className="text-sm font-semibold transition-colors"
          style={{ color: flashOn ? '#fff' : '#94a3b8' }}>
          ← Games
        </Link>
        <div>
          <h1 className="text-lg font-black text-white leading-none">⚡ Reaction Race</h1>
          <p className="text-xs mt-0.5" style={{ color: flashOn ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}>
            P1: Space · P2: Enter · First to {ROUNDS_TO_WIN} wins
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xl font-black text-white tabular-nums">
            {score.p1} – {score.p2}
          </span>
          {winner && (
            <span className="text-[#FFD700] text-sm font-bold">Player {winner} wins! 🏆</span>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-6 text-center select-none">

        {/* ── WAITING ──────────────────────────────────── */}
        {phase === 'waiting' && (
          <>
            <div className="text-8xl">⚡</div>
            <h2 className="text-3xl font-black text-white">Reaction Race</h2>
            <p className="text-slate-400 text-lg">
              P1 uses <kbd className="px-2 py-0.5 rounded bg-slate-700 text-white text-sm font-mono">Space</kbd>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              P2 uses <kbd className="px-2 py-0.5 rounded bg-slate-700 text-white text-sm font-mono">Enter</kbd>
            </p>
            <p className="text-slate-500 text-base">
              When the screen flashes green — press first to score!
              <br />
              First to {ROUNDS_TO_WIN} points wins.
            </p>
            <p className="text-[#FFD700] text-base font-bold mt-4 animate-pulse">
              Press any key to start
            </p>
          </>
        )}

        {/* ── GET READY ────────────────────────────────── */}
        {phase === 'get-ready' && (
          <>
            <div className="text-8xl animate-pulse">🟡</div>
            <h2 className="text-4xl font-black text-white">Get Ready…</h2>
            <p className="text-slate-400 text-lg">Wait for the green flash!</p>
            <p className="text-slate-600 text-sm mt-4">Don't press yet — too early costs you a point!</p>
          </>
        )}

        {/* ── FLASH ───────────────────────────────────── */}
        {phase === 'flash' && (
          <>
            <div className="text-9xl font-black text-white drop-shadow-lg">GO!</div>
            <p className="text-white text-2xl font-bold">Press NOW!</p>
          </>
        )}

        {/* ── RESULT ──────────────────────────────────── */}
        {phase === 'result' && (
          <>
            <div className="text-8xl">{roundMsg.startsWith('⚡') ? '😬' : '🥊'}</div>
            <h2 className="text-2xl font-black text-white">{roundMsg}</h2>
            <p className="text-slate-400 text-base">Next round starting…</p>
            {/* Score pips */}
            <div className="flex gap-8 mt-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">P1 (Space)</p>
                <div className="flex gap-1.5 justify-center">
                  {Array.from({ length: ROUNDS_TO_WIN }, (_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: i < score.p1 ? '#FFD700' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">P2 (Enter)</p>
                <div className="flex gap-1.5 justify-center">
                  {Array.from({ length: ROUNDS_TO_WIN }, (_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: i < score.p2 ? '#a855f7' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── GAMEOVER ──────────────────────────────────── */}
        {phase === 'gameover' && (
          <>
            <div className="text-8xl">🏆</div>
            <h2 className="text-4xl font-black text-[#FFD700]">Player {winner} Wins!</h2>
            <p className="text-white text-2xl font-bold">{score.p1} – {score.p2}</p>
            <p className="text-slate-400 text-base mt-4 animate-pulse">
              Press any key to play again
            </p>
          </>
        )}
      </main>
    </div>
  )
}
