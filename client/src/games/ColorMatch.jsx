/**
 * Color Match
 *
 * A target color is shown at the top. A large color swatch cycles through
 * options at the child's scan speed. Press SPACE when the displayed color
 * matches the target. Correct = score + positive feedback. No penalties.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

const W = 480
const H = 300

const COLORS = [
  { name: 'Red',    hex: '#ef4444' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Green',  hex: '#22c55e' },
  { name: 'Blue',   hex: '#3b82f6' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Pink',   hex: '#ec4899' },
  { name: 'White',  hex: '#f1f5f9' },
]

function rngInt(max) { return Math.floor(Math.random() * max) }

export default function ColorMatch() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  const canvasRef = useRef(null)
  const [score, setScore]   = useState(0)
  const [phase, setPhase]   = useState('waiting')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const framesPerScan = Math.max(24, Math.round(scanSpeedMs / 16.7))

    let curScore    = 0
    let curPhase    = 'waiting'
    let frame       = 0
    let targetIdx   = rngInt(COLORS.length)
    let selectorIdx = 0
    let feedback    = 0    // frames: >0 = correct flash, <0 = wrong flash
    let feedbackMsg = ''

    function newTarget() {
      let next
      do { next = rngInt(COLORS.length) } while (next === targetIdx)
      targetIdx   = next
      selectorIdx = 0
    }

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; setPhase('playing'); return }
      if (curPhase !== 'playing' || feedback !== 0) return

      if (selectorIdx === targetIdx) {
        curScore++; setScore(curScore)
        feedback    = 50; feedbackMsg = 'Yes! Great job! 🎉'
        setTimeout(() => newTarget(), 800)
      } else {
        feedback    = -40; feedbackMsg = 'Not quite — keep looking!'
      }
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++
      if (feedback > 0) { feedback--; return }
      if (feedback < 0) { feedback++; return }
      if (frame % framesPerScan === 0) {
        selectorIdx = (selectorIdx + 1) % COLORS.length
      }
    }

    function draw() {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, W, H)

      if (curPhase === 'waiting') {
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Color Match 🎨', W / 2, H / 2 - 22)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 12)
        ctx.fillStyle = '#64748b'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE when the color matches the target', W / 2, H / 2 + 38)
        ctx.textAlign = 'left'
        return
      }

      const target   = COLORS[targetIdx]
      const selector = COLORS[selectorIdx]
      const isMatch  = selectorIdx === targetIdx

      // "Target" box (left half)
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath(); ctx.roundRect(20, 20, W / 2 - 30, H - 40, 16); ctx.fill()
      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 13px Nunito, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('TARGET', W / 4 + 5, 46)
      ctx.fillStyle = target.hex
      ctx.beginPath(); ctx.roundRect(44, 58, W / 2 - 76, H - 100, 12); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Nunito, system-ui'
      ctx.fillText(target.name, W / 4 + 5, H - 36)

      // "Selector" box (right half)
      const hlColor = feedback > 0 ? '#22c55e' : feedback < 0 ? '#ef4444' : (isMatch ? '#FFD700' : 'rgba(255,255,255,0.06)')
      ctx.fillStyle = hlColor
      ctx.beginPath(); ctx.roundRect(W / 2 + 10, 20, W / 2 - 30, H - 40, 16); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      if (feedback === 0) { ctx.beginPath(); ctx.roundRect(W / 2 + 10, 20, W / 2 - 30, H - 40, 16); ctx.fill() }

      ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 13px Nunito, system-ui'
      ctx.fillText('PRESS SPACE', W * 3 / 4 - 5, 46)
      ctx.fillStyle = selector.hex
      ctx.beginPath(); ctx.roundRect(W / 2 + 34, 58, W / 2 - 76, H - 100, 12); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Nunito, system-ui'
      ctx.fillText(selector.name, W * 3 / 4 - 5, H - 36)

      // Feedback banner
      if (feedback !== 0) {
        ctx.fillStyle = feedback > 0 ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'
        ctx.fillRect(0, H / 2 - 26, W, 52)
        ctx.fillStyle = feedback > 0 ? '#22c55e' : '#ef4444'
        ctx.font = 'bold 20px Nunito, system-ui'
        ctx.fillText(feedbackMsg, W / 2, H / 2 + 7)
      }

      // Score HUD
      ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 14px Nunito, system-ui'
      ctx.fillText(`Score: ${curScore}`, W - 14, 16)
      ctx.textAlign = 'left'
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
          <h1 className="text-lg font-black text-white leading-none">🎨 Color Match</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space when the colors match</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#ec4899]">{score} ✓</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Color Match game canvas" />
      </main>
    </div>
  )
}
