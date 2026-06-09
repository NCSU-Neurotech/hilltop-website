/**
 * Painter
 *
 * Creative freeform painting — no score, no failure.
 * Two scan layers:
 *   1. A row of 8 color swatches auto-cycles at scanSpeedMs. Press SPACE to pick a color.
 *   2. Once a color is picked, a cursor moves across canvas cells. Press SPACE to paint.
 * Ideal for children who need guaranteed success and creative expression.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

const COLS = 10
const ROWS = 8
const PALETTE = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
]
const BG = '#0f172a'

export default function PainterGame() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  // Canvas grid: array of color strings or null
  const [cells, setCells]           = useState(() => Array(COLS * ROWS).fill(null))
  const [colorIdx, setColorIdx]     = useState(0)
  const [cellIdx, setCellIdx]       = useState(0)
  const [layer, setLayer]           = useState('color')   // 'color' | 'canvas'
  const [phase, setPhase]           = useState('waiting')

  const colorIdxRef = useRef(0)
  const cellIdxRef  = useRef(0)
  const layerRef    = useRef('color')
  const phaseRef    = useRef('waiting')
  const cellsRef    = useRef(cells)

  useEffect(() => { colorIdxRef.current = colorIdx }, [colorIdx])
  useEffect(() => { cellIdxRef.current  = cellIdx  }, [cellIdx])
  useEffect(() => { layerRef.current    = layer    }, [layer])
  useEffect(() => { phaseRef.current    = phase    }, [phase])
  useEffect(() => { cellsRef.current    = cells    }, [cells])

  // Color layer: cycles through palette
  useEffect(() => {
    if (phase !== 'playing' || layer !== 'color') return
    const id = setInterval(() => {
      setColorIdx((i) => (i + 1) % PALETTE.length)
    }, scanSpeedMs)
    return () => clearInterval(id)
  }, [phase, layer, scanSpeedMs])

  // Canvas layer: cycles through cells
  useEffect(() => {
    if (phase !== 'playing' || layer !== 'canvas') return
    const id = setInterval(() => {
      setCellIdx((i) => (i + 1) % (COLS * ROWS))
    }, Math.round(scanSpeedMs * 0.5))   // cells cycle faster than palette
    return () => clearInterval(id)
  }, [phase, layer, scanSpeedMs])

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

      if (layerRef.current === 'color') {
        // Pick colour → switch to canvas layer
        setLayer('canvas'); layerRef.current = 'canvas'
      } else {
        // Paint cell
        const idx   = cellIdxRef.current
        const color = PALETTE[colorIdxRef.current]
        setCells((prev) => {
          const next = [...prev]; next[idx] = color; return next
        })
        // Stay on canvas layer — keep painting
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const cellW = 46
  const cellH = 36

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
          <h1 className="text-lg font-black text-white leading-none">🎨 Painter</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {phase === 'playing'
              ? layer === 'color' ? 'Press space to pick a color' : 'Press space to paint!'
              : 'Press space to start'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {phase === 'playing' && (
            <button
              onClick={() => setCells(Array(COLS * ROWS).fill(null))}
              className="px-4 h-9 rounded-lg bg-slate-700 text-slate-200 text-sm font-semibold
                         hover:bg-slate-600 transition-colors"
            >
              Clear canvas
            </button>
          )}
          {phase === 'playing' && layer === 'canvas' && (
            <button
              onClick={() => setLayer('color')}
              className="px-4 h-9 rounded-lg text-sm font-semibold transition-colors"
              style={{ backgroundColor: PALETTE[colorIdx] + '33', color: PALETTE[colorIdx] }}
            >
              Change color
            </button>
          )}
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {phase === 'waiting' ? (
          <div className="text-center">
            <div className="text-7xl mb-4">🎨</div>
            <h2 className="text-white font-black text-2xl mb-2">Painter</h2>
            <p className="text-slate-400 text-base mb-6">Create your own colorful art!</p>
            <p className="text-[#FFD700] font-bold text-lg">Press SPACE to start</p>
          </div>
        ) : (
          <>
            {/* Color palette strip */}
            <div className="flex gap-2">
              {PALETTE.map((col, i) => (
                <div
                  key={i}
                  className="rounded-lg transition-all duration-100"
                  style={{
                    width:  layer === 'color' && i === colorIdx ? 52 : 40,
                    height: layer === 'color' && i === colorIdx ? 52 : 40,
                    backgroundColor: col,
                    outline: layer === 'color' && i === colorIdx
                      ? '4px solid white'
                      : i === colorIdx
                        ? `3px solid ${col}`
                        : '2px solid transparent',
                    boxShadow: layer === 'color' && i === colorIdx ? `0 0 18px ${col}` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Current color label */}
            <p className="text-sm font-semibold" style={{ color: PALETTE[colorIdx] }}>
              {layer === 'color' ? '← Press SPACE to pick this color' : `Painting with this color — press SPACE to paint`}
            </p>

            {/* Canvas grid */}
            <div
              className="rounded-xl overflow-hidden border-2 border-slate-700"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLS}, ${cellW}px)`,
                gap: 2,
                backgroundColor: '#1e293b',
                padding: 2,
              }}
            >
              {cells.map((color, i) => (
                <div
                  key={i}
                  style={{
                    width:   cellW,
                    height:  cellH,
                    backgroundColor: color || '#0f172a',
                    outline: layer === 'canvas' && i === cellIdx
                      ? '3px solid white'
                      : 'none',
                    boxShadow: layer === 'canvas' && i === cellIdx
                      ? `0 0 12px ${PALETTE[colorIdx]}`
                      : 'none',
                    borderRadius: 4,
                    transition: 'background-color 0.1s',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
