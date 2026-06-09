/**
 * Whack-a-Mole
 *
 * 6 holes arranged in a 3×2 grid. Moles randomly pop up.
 * The scan sweeps holes in order at the child's scan speed.
 * Press SPACE when the highlighted hole has a mole in it. Score a point!
 * Missing (pressing on an empty hole) = no penalty. Very forgiving.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { playCatchSound, playClickSound } from '../utils/audio'

const W    = 540
const H    = 320
const COLS = 3
const ROWS = 2

function makeHoles() {
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const cellW = W / COLS
    const cellH = (H - 40) / ROWS
    return {
      x:       cellW * col + cellW / 2,
      y:       80 + cellH * row + cellH / 2,
      mole:    false,
      timer:   0,      // frames remaining (counts down)
      maxTimer: 0,     // total lifetime when spawned (used for pop animation)
      whacked: false,
    }
  })
}

function rngInt(max) { return Math.floor(Math.random() * max) }

export default function WhackAMole() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  const canvasRef  = useRef(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const framesPerScan = Math.max(24, Math.round(scanSpeedMs / 16.7))
    // Mole stays up for 3–5 scan cycles
    const moleLifetime = () => framesPerScan * (3 + rngInt(3))
    // New mole spawns every 2.5–4 scan cycles
    const spawnDelay   = () => framesPerScan * (2 + rngInt(3))

    let holes      = makeHoles()
    let hlIndex    = 0
    let frame      = 0
    let curScore   = 0
    let curPhase   = 'waiting'
    let nextSpawn  = spawnDelay()

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; playClickSound(); return }
      if (curPhase !== 'playing') return

      const h = holes[hlIndex]
      if (h.mole && !h.whacked) {
        h.whacked = true
        h.timer   = 18   // short whack animation
        curScore++; setScore(curScore)
        playCatchSound()
      }
      // No penalty for empty hole — just advance
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++

      // Advance highlight
      if (frame % framesPerScan === 0) {
        hlIndex = (hlIndex + 1) % holes.length
      }

      // Tick mole timers
      for (const h of holes) {
        if ((h.mole || h.whacked) && h.timer > 0) {
          h.timer--
          if (h.timer === 0) { h.mole = false; h.whacked = false }
        }
      }

      // Spawn new mole
      nextSpawn--
      if (nextSpawn <= 0) {
        const empty = holes.filter((h) => !h.mole)
        if (empty.length > 0) {
          const chosen = empty[rngInt(empty.length)]
          chosen.mole     = true
          chosen.timer    = moleLifetime()
          chosen.maxTimer = chosen.timer   // store for pop animation
          chosen.whacked  = false
        }
        nextSpawn = spawnDelay()
      }
    }

    function draw() {
      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#0c1a0c')
      bg.addColorStop(1, '#1a3a1a')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Grass strip
      ctx.fillStyle = '#14532d'; ctx.fillRect(0, H - 30, W, 30)
      ctx.fillStyle = '#16a34a'; ctx.fillRect(0, H - 34, W, 6)

      if (curPhase === 'waiting') {
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Whack-a-Mole 🐹', W / 2, H / 2 - 22)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 12)
        ctx.fillStyle = '#64748b'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE when a mole is in the glowing hole', W / 2, H / 2 + 38)
        ctx.textAlign = 'left'
        return
      }

      // Draw each hole
      holes.forEach((h, i) => {
        const hl = i === hlIndex

        // Hole shadow
        ctx.fillStyle = '#000'
        ctx.globalAlpha = 0.6
        ctx.beginPath(); ctx.ellipse(h.x, h.y + 4, 38, 16, 0, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1

        // Hole
        ctx.fillStyle = '#1c1008'
        ctx.beginPath(); ctx.ellipse(h.x, h.y, 36, 15, 0, 0, Math.PI * 2); ctx.fill()

        // Highlight ring
        if (hl) {
          ctx.strokeStyle = '#FFD700'
          ctx.lineWidth   = 4
          ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 18
          ctx.beginPath(); ctx.ellipse(h.x, h.y, 42, 20, 0, 0, Math.PI * 2); ctx.stroke()
          ctx.shadowBlur  = 0
        }

        // Mole
        if (h.mole) {
          const popFrac = h.whacked ? h.timer / 18 : Math.min(1, (h.maxTimer - h.timer + 8) / 12)
          const moleY   = h.y - 28 * popFrac
          const moleR   = 22 * popFrac

          // Body
          ctx.fillStyle = h.whacked ? '#fde68a' : '#92400e'
          ctx.beginPath(); ctx.arc(h.x, moleY, moleR, 0, Math.PI * 2); ctx.fill()

          if (popFrac > 0.4) {
            // Eyes
            ctx.fillStyle = '#1c1008'
            ctx.beginPath(); ctx.arc(h.x - 7, moleY - 4, 4, 0, Math.PI * 2); ctx.fill()
            ctx.beginPath(); ctx.arc(h.x + 7, moleY - 4, 4, 0, Math.PI * 2); ctx.fill()
            // Nose
            ctx.fillStyle = '#f9a8d4'
            ctx.beginPath(); ctx.arc(h.x, moleY + 3, 4, 0, Math.PI * 2); ctx.fill()
          }

          // Stars if whacked
          if (h.whacked && h.timer > 10) {
            ctx.fillStyle = '#FFD700'; ctx.font = 'bold 18px Nunito, system-ui'; ctx.textAlign = 'center'
            ctx.fillText('⭐', h.x, moleY - moleR - 6)
          }
        }
      })

      ctx.textAlign = 'left'

      // Score HUD
      ctx.font      = 'bold 16px Nunito, system-ui'
      ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(`${curScore} whacked!`, W - 14, 28)
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
          <h1 className="text-lg font-black text-white leading-none">🐹 Whack-a-Mole</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space when a mole is in the glowing hole</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#f59e0b]">{score} ⭐</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Whack-a-Mole game canvas" />
      </main>
    </div>
  )
}
