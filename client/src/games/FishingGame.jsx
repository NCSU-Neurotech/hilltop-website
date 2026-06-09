/**
 * Fishing Game
 *
 * Fish swim across the screen. The scan engine highlights each fish in turn.
 * Press SPACE to cast a line and catch the highlighted fish.
 * Catch 10 fish to fill your bucket — then celebrate and start again!
 * No penalties — forgiving single-switch game.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { playCatchSound, playClickSound } from '../utils/audio'

const W = 560
const H = 320
const WATER_Y = 140

function rng(min, max) { return min + Math.random() * (max - min) }
function rngInt(max)   { return Math.floor(Math.random() * max) }

const FISH_COLORS = ['#f97316','#22c55e','#3b82f6','#ec4899','#eab308','#a855f7','#ef4444','#06b6d4']
const FISH_EMOJIS = ['🐟','🐠','🐡','🦈','🐙']

function makeFish(id) {
  const goRight = Math.random() > 0.5
  return {
    id,
    x:     goRight ? -60 : W + 60,
    y:     WATER_Y + rng(20, H - WATER_Y - 30),
    speed: rng(0.6, 1.4) * (goRight ? 1 : -1),
    color: FISH_COLORS[rngInt(FISH_COLORS.length)],
    emoji: FISH_EMOJIS[rngInt(FISH_EMOJIS.length)],
    size:  rng(22, 36),
    caught: false,
    catchAnim: 0,
  }
}

export default function FishingGame() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  const canvasRef  = useRef(null)
  const [score, setScore]   = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const framesPerScan = Math.max(24, Math.round(scanSpeedMs / 16.7))
    const GOAL = 10

    let fish      = [makeFish(0), makeFish(1), makeFish(2)]
    let nextId    = 3
    let hlIndex   = 0
    let frame     = 0
    let curScore  = 0
    let curPhase  = 'waiting'
    let lineAnim  = null   // { fromX, fromY, toX, toY, frames }
    let celebrating = 0

    function getLiveFish() { return fish.filter(f => !f.caught) }

    function nextHighlight() {
      const live = getLiveFish()
      if (!live.length) return
      const cur = live.find(f => f.id === fish[hlIndex]?.id)
      const liveIdx = live.indexOf(cur)
      const next = live[(liveIdx + 1) % live.length]
      hlIndex = fish.indexOf(next)
    }

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; playClickSound(); return }
      if (curPhase !== 'playing' || celebrating > 0) return

      const f = fish[hlIndex]
      if (!f || f.caught) return

      f.caught    = true
      f.catchAnim = 40
      lineAnim    = { x: f.x, y: f.y, frames: 30 }
      curScore++
      setScore(curScore)
      playCatchSound()

      if (curScore >= GOAL) {
        celebrating = 100
      } else {
        nextHighlight()
      }
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++

      if (frame % framesPerScan === 0 && celebrating === 0) nextHighlight()

      // Move fish
      for (const f of fish) {
        if (!f.caught) f.x += f.speed
        if (f.catchAnim > 0) f.catchAnim--
      }

      // Remove offscreen, spawn new
      fish = fish.filter(f => f.caught || (f.x > -80 && f.x < W + 80))
      while (fish.length < 3) { fish.push(makeFish(nextId++)) }

      if (lineAnim) {
        lineAnim.frames--
        if (lineAnim.frames <= 0) lineAnim = null
      }

      if (celebrating > 0) {
        celebrating--
        if (celebrating === 0) {
          fish = [makeFish(nextId++), makeFish(nextId++), makeFish(nextId++)]
          curScore = 0; setScore(0)
        }
      }
    }

    function draw() {
      // Sky
      ctx.fillStyle = '#0c1e3b'; ctx.fillRect(0, 0, W, H)
      // Water
      const wg = ctx.createLinearGradient(0, WATER_Y, 0, H)
      wg.addColorStop(0, '#0e3a5c'); wg.addColorStop(1, '#061628')
      ctx.fillStyle = wg; ctx.fillRect(0, WATER_Y, W, H - WATER_Y)
      // Water surface
      ctx.strokeStyle = 'rgba(147,197,253,0.35)'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(0, WATER_Y); ctx.lineTo(W, WATER_Y); ctx.stroke()

      // Dock
      ctx.fillStyle = '#78350f'; ctx.fillRect(W / 2 - 30, 40, 60, WATER_Y - 40)
      ctx.fillStyle = '#92400e'; ctx.fillRect(W / 2 - 40, 36, 80, 16)

      // Fishing line
      if (lineAnim) {
        const pct = 1 - lineAnim.frames / 30
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(W / 2, 52)
        ctx.lineTo(W / 2 + (lineAnim.x - W / 2) * pct, 52 + (lineAnim.y - 52) * pct)
        ctx.stroke()
      }

      // Fish
      fish.forEach((f, i) => {
        const hl = i === hlIndex && !f.caught && celebrating === 0
        ctx.save()
        ctx.translate(f.x, f.y)
        if (f.speed < 0) ctx.scale(-1, 1)

        if (hl) {
          ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 20
          ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3
          ctx.beginPath(); ctx.ellipse(0, 0, f.size + 8, f.size * 0.6 + 6, 0, 0, Math.PI * 2); ctx.stroke()
        }

        ctx.font = `${f.size}px serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.globalAlpha = f.caught ? Math.max(0, f.catchAnim / 40) : 1
        ctx.fillText(f.emoji, 0, 0)
        ctx.globalAlpha = 1
        ctx.restore()
      })

      // Score / goal
      ctx.font = 'bold 15px Nunito, system-ui'; ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(`${curScore} / ${GOAL} 🐟`, W - 14, 24)

      // Bucket progress
      for (let i = 0; i < GOAL; i++) {
        ctx.fillStyle = i < curScore ? '#22c55e' : 'rgba(255,255,255,0.1)'
        ctx.beginPath(); ctx.arc(14 + i * 18, 24, 6, 0, Math.PI * 2); ctx.fill()
      }

      if (celebrating > 0) {
        ctx.fillStyle = 'rgba(12,30,59,0.82)'; ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 28px Nunito, system-ui'
        ctx.fillText('Full bucket! 🎣', W / 2, H / 2 - 16)
        ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText(`You caught all ${GOAL} fish! Amazing!`, W / 2, H / 2 + 18)
      }

      if (curPhase === 'waiting') {
        ctx.fillStyle = 'rgba(12,30,59,0.84)'; ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Fishing 🎣', W / 2, H / 2 - 22)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 12)
        ctx.fillStyle = '#64748b'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE to catch the glowing fish', W / 2, H / 2 + 38)
      }
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
          <h1 className="text-lg font-black text-white leading-none">🎣 Fishing</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space to catch the glowing fish</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#06b6d4]">{score} 🐟</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Fishing game canvas" />
      </main>
    </div>
  )
}
