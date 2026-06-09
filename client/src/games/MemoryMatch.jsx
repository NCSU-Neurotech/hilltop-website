/**
 * Memory Match
 *
 * A 3×4 grid of 12 cards (6 matching pairs). All face-down.
 * The scan engine highlights each card at the child's scan speed.
 * Press SPACE to flip the highlighted card.
 * Match pairs to clear them. No time pressure — purely turn-based.
 *
 * State machine:
 *   idle → flipping1 → flipping2 → evaluating (auto) → idle / mismatch-pause → idle
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

const COLS = 4
const ROWS = 3
const TOTAL = COLS * ROWS

const CARD_PAIRS = ['🐶','🐱','🐻','🦊','🐸','🦋']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCards() {
  const pairs = [...CARD_PAIRS, ...CARD_PAIRS]
  const shuffled = shuffle(pairs)
  return shuffled.map((emoji, i) => ({
    id: i, emoji, faceUp: false, matched: false,
  }))
}

export default function MemoryMatch() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  const [cards, setCards]       = useState(makeCards)
  const [hlIdx, setHlIdx]       = useState(0)
  const [phase, setPhase]       = useState('waiting')     // waiting | playing
  const [turnState, setTurnState] = useState('idle')      // idle | flipping2 | evaluating | mismatch
  const [firstIdx, setFirstIdx] = useState(null)
  const [matchCount, setMatchCount] = useState(0)
  const [celebrating, setCelebrating] = useState(false)

  // Refs for spacebar handler (avoids stale closure)
  const cardsRef     = useRef(cards)
  const hlIdxRef     = useRef(hlIdx)
  const phaseRef     = useRef(phase)
  const turnRef      = useRef(turnState)
  const firstIdxRef  = useRef(firstIdx)
  const matchRef     = useRef(matchCount)

  useEffect(() => { cardsRef.current = cards }, [cards])
  useEffect(() => { hlIdxRef.current = hlIdx }, [hlIdx])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { turnRef.current  = turnState }, [turnState])
  useEffect(() => { firstIdxRef.current = firstIdx }, [firstIdx])
  useEffect(() => { matchRef.current = matchCount }, [matchCount])

  // Auto-advance highlight (scan)
  useEffect(() => {
    if (phase !== 'playing' || turnState === 'evaluating' || turnState === 'mismatch') return
    const id = setInterval(() => {
      setHlIdx((i) => (i + 1) % TOTAL)
    }, scanSpeedMs)
    return () => clearInterval(id)
  }, [phase, turnState, scanSpeedMs])

  // Spacebar handler
  useEffect(() => {
    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()

      if (phaseRef.current === 'waiting') {
        setPhase('playing'); phaseRef.current = 'playing'
        return
      }
      if (phaseRef.current !== 'playing') return
      if (turnRef.current === 'evaluating' || turnRef.current === 'mismatch') return

      const idx  = hlIdxRef.current
      const card = cardsRef.current[idx]
      if (!card || card.faceUp || card.matched) return

      if (turnRef.current === 'idle') {
        // Flip first card
        setCards((prev) => prev.map((c, i) => i === idx ? { ...c, faceUp: true } : c))
        setFirstIdx(idx); firstIdxRef.current = idx
        setTurnState('flipping2'); turnRef.current = 'flipping2'

      } else if (turnRef.current === 'flipping2') {
        if (idx === firstIdxRef.current) return   // same card — ignore

        // Flip second card
        setCards((prev) => prev.map((c, i) => i === idx ? { ...c, faceUp: true } : c))
        setTurnState('evaluating'); turnRef.current = 'evaluating'

        // Evaluate after short delay
        setTimeout(() => {
          const c1 = cardsRef.current[firstIdxRef.current]
          const c2 = cardsRef.current[idx]
          if (c1.emoji === c2.emoji) {
            // Match!
            setCards((prev) => prev.map((c, i) =>
              i === firstIdxRef.current || i === idx ? { ...c, matched: true } : c
            ))
            const newMatch = matchRef.current + 1
            setMatchCount(newMatch); matchRef.current = newMatch
            setFirstIdx(null); firstIdxRef.current = null
            setTurnState('idle'); turnRef.current = 'idle'
            if (newMatch >= CARD_PAIRS.length) {
              setCelebrating(true)
              setTimeout(() => {
                setCards(makeCards()); setMatchCount(0); matchRef.current = 0
                setHlIdx(0); setFirstIdx(null); setTurnState('idle')
                setCelebrating(false)
              }, 2500)
            }
          } else {
            // Mismatch — pause then flip back
            setTurnState('mismatch'); turnRef.current = 'mismatch'
            setTimeout(() => {
              setCards((prev) => prev.map((c, i) =>
                i === firstIdxRef.current || i === idx ? { ...c, faceUp: false } : c
              ))
              setFirstIdx(null); firstIdxRef.current = null
              setTurnState('idle'); turnRef.current = 'idle'
            }, 900)
          }
        }, 300)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const cellW = 90
  const cellH = 80

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/games`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Games
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">🃏 Memory Match</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space to flip the glowing card</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#14b8a6]">{matchCount}/{CARD_PAIRS.length} ✓</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {phase === 'waiting' ? (
          <div className="text-center">
            <div className="text-7xl mb-4">🃏</div>
            <h2 className="text-white font-black text-2xl mb-2">Memory Match</h2>
            <p className="text-slate-400 text-base mb-2">Find the matching pairs of cards!</p>
            <p className="text-slate-500 text-sm mb-6">Press space to flip a card — find two that are the same</p>
            <p className="text-[#FFD700] font-bold text-lg">Press SPACE to start</p>
          </div>
        ) : celebrating ? (
          <div className="text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-white font-black text-2xl mb-2">All matched!</h2>
            <p className="text-[#FFD700] font-bold text-lg">Amazing memory! New game starting…</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, ${cellW}px)`,
              gap: 10,
            }}
          >
            {cards.map((card, i) => {
              const isHl      = i === hlIdx && !card.matched
              const isVisible = card.faceUp || card.matched
              return (
                <div
                  key={card.id}
                  style={{
                    width:  cellW,
                    height: cellH,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    cursor: 'default',
                    backgroundColor: card.matched
                      ? '#14b8a622'
                      : isVisible
                        ? '#1e3a5f'
                        : isHl
                          ? '#1e3a5f'
                          : '#1e293b',
                    outline: isHl ? '4px solid white' : card.matched ? '2px solid #14b8a6' : '2px solid transparent',
                    boxShadow: isHl ? '0 0 20px rgba(255,255,255,0.4)' : card.matched ? '0 0 12px #14b8a666' : 'none',
                    transition: 'background-color 0.15s, outline 0.1s',
                  }}
                >
                  {isVisible ? (
                    <span>{card.emoji}</span>
                  ) : (
                    <span style={{ fontSize: 28, opacity: 0.3 }}>❓</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {phase === 'playing' && !celebrating && (
          <p className="text-slate-500 text-sm">
            {turnState === 'idle' ? 'Press space to flip a card' :
             turnState === 'flipping2' ? 'Good! Now press space to flip another card' :
             turnState === 'mismatch' ? 'Not a match — trying again…' : ''}
          </p>
        )}
      </main>
    </div>
  )
}
