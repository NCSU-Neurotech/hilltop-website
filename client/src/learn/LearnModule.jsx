/**
 * LearnModule — /dashboard/child/:childId/learn/:moduleId
 *
 * Generic flashcard runner for all learning modules.
 *
 * Each card shows:
 *   • A large symbol  (letter / number)
 *   • An emoji illustration
 *   • An optional dot counter (numbers module)
 *   • The word label
 *
 * On every card load the text is spoken aloud via Web Speech API.
 *
 * Navigation (child mode): ScanGroup cycles ["Read Again", "Next Card"]
 *   Last card → ["Read Again", "Finish ✓"]
 *   Finished screen → ["Play Again", "Go Back"]
 *
 * Navigation (caregiver): plain buttons + prev arrow.
 *
 * Module not found → friendly error screen.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'
import { useSpeech } from '../hooks/useSpeech'
import MODULES from './index'

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ total, current }) {
  const pct = total > 1 ? (current / (total - 1)) * 100 : 100
  return (
    <div className="w-full max-w-md h-2 rounded-full bg-slate-700/60 overflow-hidden"
         aria-label={`Card ${current + 1} of ${total}`}>
      <div
        className="h-full rounded-full transition-all duration-400"
        style={{ width: `${pct}%`, backgroundColor: '#FFD700' }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Flashcard face
// ---------------------------------------------------------------------------

function Flashcard({ card, color, transitioning }) {
  return (
    <div
      className="flex flex-col items-center gap-4 transition-opacity duration-150"
      style={{ opacity: transitioning ? 0 : 1 }}
    >
      {/* Symbol */}
      <div
        className="flex items-center justify-center rounded-3xl font-black select-none"
        style={{
          width: 140, height: 140,
          backgroundColor: color + '28',
          border: `4px solid ${color}66`,
          color,
          fontSize: 80,
          lineHeight: 1,
        }}
        aria-label={card.symbol}
      >
        {card.symbol}
      </div>

      {/* Illustration */}
      <div className="text-7xl leading-none select-none" aria-hidden>
        {card.illustration}
      </div>

      {/* Dot counter (numbers only) */}
      {card.dots && (
        <p className="text-slate-400 text-lg tracking-widest font-mono select-none">
          {card.dots}
        </p>
      )}

      {/* Word label */}
      <p
        className="font-black text-center"
        style={{ color, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)' }}
      >
        {card.word}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Action button face (used inside ScanItem)
// ---------------------------------------------------------------------------

function ActionButton({ label }) {
  return (
    <div
      className="flex items-center justify-center px-6 h-14 rounded-2xl
                 bg-[#1e293b] border-2 border-slate-600 select-none
                 text-white font-black text-base whitespace-nowrap
                 hover:border-slate-400 transition-colors"
      style={{ minWidth: 160 }}
    >
      {label}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LearnModule() {
  const { childId, moduleId } = useParams()
  const navigate = useNavigate()
  const { isChildMode, scanProfile } = useScan()
  const { speak, cancel } = useSpeech()

  const mod = MODULES[moduleId]

  const [cardIndex, setCardIndex]   = useState(0)
  const [finished, setFinished]     = useState(false)
  const [transitioning, setTrans]   = useState(false)
  const [speaking, setSpeaking]     = useState(false)
  const spokenRef = useRef(-1)  // tracks last spoken card index to avoid double-fire

  const isLastCard = mod ? cardIndex === mod.cards.length - 1 : false

  // ── TTS on card change ─────────────────────────────────────
  useEffect(() => {
    if (!mod || finished) return
    if (spokenRef.current === cardIndex) return
    spokenRef.current = cardIndex

    const card = mod.cards[cardIndex]
    setSpeaking(true)
    speak(card.ttsText, { rate: scanProfile.voiceRate, pitch: scanProfile.voicePitch })

    // Estimate speaking time to clear indicator
    const words = card.ttsText.split(/\s+/).length
    const ms = (words / (scanProfile.voiceRate * 2.5)) * 1000 + 300
    const t = setTimeout(() => setSpeaking(false), ms)
    return () => clearTimeout(t)
  }, [cardIndex, finished, mod, speak, scanProfile.voiceRate, scanProfile.voicePitch])

  // ── Page transition ─────────────────────────────────────────
  function changeCard(nextIdx) {
    cancel()
    setTrans(true)
    setTimeout(() => {
      setCardIndex(nextIdx)
      setTrans(false)
    }, 150)
  }

  // ── Actions ─────────────────────────────────────────────────
  const readAgain = useCallback(() => {
    if (!mod || finished) return
    const card = mod.cards[cardIndex]
    cancel()
    spokenRef.current = -1  // force re-speak
    setSpeaking(true)
    speak(card.ttsText, { rate: scanProfile.voiceRate, pitch: scanProfile.voicePitch })
    const words = card.ttsText.split(/\s+/).length
    const ms = (words / (scanProfile.voiceRate * 2.5)) * 1000 + 300
    setTimeout(() => setSpeaking(false), ms)
  }, [mod, cardIndex, finished, cancel, speak, scanProfile.voiceRate, scanProfile.voicePitch])

  const goNext = useCallback(() => {
    if (!mod) return
    if (isLastCard) {
      cancel()
      setFinished(true)
    } else {
      changeCard(cardIndex + 1)
    }
  }, [mod, isLastCard, cardIndex, cancel])

  const playAgain = useCallback(() => {
    cancel()
    spokenRef.current = -1
    setCardIndex(0)
    setFinished(false)
  }, [cancel])

  const goBack = useCallback(() => {
    cancel()
    navigate(`/dashboard/child/${childId}/learn`)
  }, [cancel, navigate, childId])

  // ── Not found ────────────────────────────────────────────────
  if (!mod) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">📚</div>
        <h1 className="text-white font-black text-xl">Module not found</h1>
        <Link to={`/dashboard/child/${childId}/learn`}
          className="text-[#FFD700] text-sm font-semibold hover:underline">
          ← Back to Learn
        </Link>
      </div>
    )
  }

  // ── Finished screen ──────────────────────────────────────────
  if (finished) {
    const finishedActions = [
      { label: '🔄 Play Again', fn: playAgain },
      { label: '🏠 Go Back',    fn: goBack },
    ]

    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
          {!isChildMode && (
            <button onClick={goBack}
              className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
              ← Learn
            </button>
          )}
          <h1 className="text-lg font-black text-white">{mod.emoji} {mod.title}</h1>
          {isChildMode && (
            <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
          )}
        </header>

        <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
          <div className="text-8xl select-none" aria-hidden>🌟</div>
          <div className="text-center">
            <h2 className="text-3xl font-black text-white mb-2">Well done!</h2>
            <p className="text-slate-400 text-base">
              You finished all {mod.cards.length} cards!
            </p>
          </div>

          {isChildMode ? (
            <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs} highlightColor={scanProfile.scanHighlightColor}>
              <div className="flex gap-4 justify-center flex-wrap">
                {finishedActions.map((a) => (
                  <ScanItem key={a.label} onSelect={a.fn} as="div" style={{ minWidth: 0, minHeight: 0 }} className="rounded-2xl">
                    <ActionButton label={a.label} />
                  </ScanItem>
                ))}
              </div>
            </ScanGroup>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              {finishedActions.map((a) => (
                <button key={a.label} onClick={a.fn}
                  className="px-6 h-11 rounded-xl bg-[#1e293b] text-white text-sm font-semibold
                             border border-slate-600 hover:border-slate-400 transition-colors">
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // ── Normal card view ─────────────────────────────────────────
  const card = mod.cards[cardIndex]

  const navActions = [
    { label: '🔄 Read Again', fn: readAgain },
    isLastCard
      ? { label: '✓ Finish',     fn: goNext }
      : { label: '→ Next Card',  fn: goNext },
  ]

  const actionBar = isChildMode ? (
    <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs} highlightColor={scanProfile.scanHighlightColor}>
      <div className="flex gap-4 justify-center flex-wrap">
        {navActions.map((a) => (
          <ScanItem key={a.label} onSelect={a.fn} as="div" style={{ minWidth: 0, minHeight: 0 }} className="rounded-2xl">
            <ActionButton label={a.label} />
          </ScanItem>
        ))}
      </div>
    </ScanGroup>
  ) : (
    <div className="flex gap-3 justify-center flex-wrap">
      {cardIndex > 0 && (
        <button onClick={() => changeCard(cardIndex - 1)}
          className="px-5 h-11 rounded-xl bg-[#1e293b] text-slate-300 text-sm font-semibold
                     border border-slate-700 hover:border-slate-500 transition-colors">
          ← Prev
        </button>
      )}
      {navActions.map((a) => (
        <button key={a.label} onClick={a.fn}
          className="px-6 h-11 rounded-xl bg-[#1e293b] text-white text-sm font-semibold
                     border border-slate-600 hover:border-slate-400 transition-colors">
          {a.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/learn`}
            onClick={() => cancel()}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Learn
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">
            {mod.emoji} {mod.title}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Card {cardIndex + 1} of {mod.cards.length}
            <span aria-live="polite" aria-atomic="true" className="ml-2">
              {speaking && <span className="text-[#FFD700] animate-pulse">🔊</span>}
            </span>
          </p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-8">
        {/* Flashcard */}
        <Flashcard card={card} color={mod.color} transitioning={transitioning} />

        {/* Progress bar */}
        <ProgressBar total={mod.cards.length} current={cardIndex} />

        {/* Action buttons */}
        <div className="w-full max-w-md">
          {actionBar}
        </div>
      </main>
    </div>
  )
}
