/**
 * Bubble Pop
 *
 * A 4×3 grid of coloured bubbles is shown on canvas.
 * The scan engine highlights one bubble at a time automatically.
 * Press SPACE to pop the highlighted bubble.
 * No lives / no failure — purely additive and satisfying.
 * Ideal for younger children or those who need guaranteed success.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { playClickSound, playPopSound } from '../utils/audio'

const W = 560
const H = 360
const COLS = 4
const ROWS = 3
const BUBBLE_R = 40
const PAD_X = 56
const PAD_Y = 48

const BUBBLE_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  '#10b981','#f59e0b','#a855f7','#14b8a6',
]

function makeBubbles() {
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    return {
      x:       PAD_X + col * ((W - PAD_X * 2) / (COLS - 1)),
      y:       PAD_Y + row * ((H - PAD_Y * 2) / (ROWS - 1)),
      color:   BUBBLE_COLORS[i % BUBBLE_COLORS.length],
      alive:   true,
      popAnim: 0,   // >0 = pop animation frames remaining
    }
  })
}

function drawRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

export default function BubblePop() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  const canvasRef = useRef(null)
  const [score, setScore]   = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const framesPerScan = Math.max(20, Math.round(scanSpeedMs / 16.7))

    let bubbles      = makeBubbles()
    let hlIndex      = 0
    let frame        = 0
    let curScore     = 0
    let curPhase     = 'waiting'
    let celebrating  = 0

    function nextHighlight() {
      let attempts = 0
      do {
        hlIndex = (hlIndex + 1) % bubbles.length
        attempts++
      } while (!bubbles[hlIndex].alive && attempts < bubbles.length)
    }

    function resetGrid() {
      bubbles   = makeBubbles()
      hlIndex   = 0
      celebrating = 0
    }

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; playClickSound(); return }
      if (curPhase !== 'playing') return

      const b = bubbles[hlIndex]
      if (!b || !b.alive) return

      b.alive   = false
      b.popAnim = 12
      curScore++
      setScore(curScore)
      playPopSound()

      if (bubbles.every((bbl) => !bbl.alive)) {
        celebrating = 90
      } else {
        nextHighlight()
      }
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++

      if (frame % framesPerScan === 0 && celebrating === 0) {
        nextHighlight()
      }

      for (const b of bubbles) {
        if (b.popAnim > 0) b.popAnim--
      }

      if (celebrating > 0) {
        celebrating--
        if (celebrating === 0) resetGrid()
      }
    }

    function draw() {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(255,255,255,0.03)'
      ctx.beginPath(); drawRoundRect(ctx, 20, 20, W - 40, H - 40, 20); ctx.fill()

      for (let i = 0; i < bubbles.length; i++) {
        const b  = bubbles[i]
        const hl = i === hlIndex && b.alive && celebrating === 0
        const pa = b.popAnim

        if (!b.alive && pa === 0) continue

        const scale = b.alive ? (hl ? 1.12 : 1.0) : Math.max(0, pa / 12) * 1.6
        const r     = BUBBLE_R * scale
        const alpha = b.alive ? 1 : (pa / 12) * 0.7

        ctx.globalAlpha = alpha

        if (hl) { ctx.shadowColor = b.color; ctx.shadowBlur = 22 }

        ctx.fillStyle = b.color
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2); ctx.fill()

        if (b.alive) {
          ctx.fillStyle = 'rgba(255,255,255,0.35)'
          ctx.beginPath(); ctx.arc(b.x - r * 0.25, b.y - r * 0.28, r * 0.32, 0, Math.PI * 2); ctx.fill()
        }

        if (hl) {
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 4
          ctx.beginPath(); ctx.arc(b.x, b.y, r + 6, 0, Math.PI * 2); ctx.stroke()
        }

        ctx.shadowBlur = 0; ctx.globalAlpha = 1
      }

      ctx.font = 'bold 16px Nunito, system-ui'; ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(`${curScore} popped!`, W - 14, 22)
      ctx.textAlign = 'left'

      if (celebrating > 0) {
        ctx.fillStyle = 'rgba(15,23,42,0.75)'; ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 28px Nunito, system-ui'
        ctx.fillText('Amazing! 🎉', W / 2, H / 2 - 16)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('All bubbles popped! New bubbles coming…', W / 2, H / 2 + 18)
        ctx.textAlign = 'left'
      }

      if (curPhase === 'waiting') {
        ctx.fillStyle = 'rgba(15,23,42,0.82)'; ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Bubble Pop 🫧', W / 2, H / 2 - 22)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 12)
        ctx.fillStyle = '#64748b'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE to pop the glowing bubble', W / 2, H / 2 + 38)
        ctx.textAlign = 'left'
      }
    }

    let raf
    function loop() { update(); draw(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', handleKey) }
  }, [scanSpeedMs])

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
          <h1 className="text-lg font-black text-white leading-none">🫧 Bubble Pop</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space to pop the glowing bubble</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#22c55e]">{score} 🫧</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Bubble Pop game canvas" />
      </main>
    </div>
  )
}
