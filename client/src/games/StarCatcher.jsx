/**
 * Star Catcher — redesigned for single-switch accessibility.
 *
 * Three basket positions are shown at the bottom (left / center / right).
 * The scan automatically cycles through them at the child's speed.
 * Press SPACE to move the basket to the highlighted position.
 * Stars fall one at a time in a random lane — catch them by being in the right spot!
 * No lives, no penalty — purely additive scoring.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

const W        = 560
const H        = 320
const LANE_XS  = [100, 280, 460]
const BASKET_Y = H - 42
const BASKET_W = 90
const BASKET_H = 26
const STAR_COLORS = ['#FFD700','#fbbf24','#f59e0b','#fffbeb','#fde68a','#a5f3fc']

function rng(min, max) { return min + Math.random() * (max - min) }
function rngInt(n)     { return Math.floor(Math.random() * n) }

function drawStarShape(ctx, cx, cy, outerR, col) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle  = (i * Math.PI) / 5 - Math.PI / 2
    const radius = i % 2 === 0 ? outerR : outerR * 0.42
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = col; ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke()
}

export default function StarCatcher() {
  const { childId }  = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs  = scanProfile.scanSpeedMs

  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState('waiting')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const framesPerScan = Math.max(24, Math.round(scanSpeedMs / 16.7))
    // Star fall speed: takes ~4 scan-cycles to reach bottom (gives child time to react)
    const fallSpeed     = Math.max(0.4, (BASKET_Y * 16.7) / (scanSpeedMs * 4))
    // Gap between stars: 2 scan-cycles of rest
    const respawnDelay  = () => Math.round(framesPerScan * 2)

    // Background twinkles (static)
    const bgStars = Array.from({ length: 60 }, () => ({
      x: rng(0, W), y: rng(0, H - 60),
      r: rng(0.4, 1.8), a: rng(0.2, 0.9),
    }))

    let hlIndex    = 0          // scan-highlighted basket (0-2)
    let activeLane = 1          // where the basket actually is
    let basketX    = LANE_XS[1] // smooth x
    let frame      = 0
    let curScore   = 0
    let curPhase   = 'waiting'

    // Star state
    let star = { x: LANE_XS[1], y: -20, color: '#FFD700', rot: 0, rotSpd: 0.04, active: false }
    let waitTimer = respawnDelay()
    let catchAnim = 0     // frames of catch sparkle at basket
    let missBlink = 0     // frames of miss flash at bottom

    function spawnStar() {
      const lane = rngInt(3)
      star.x      = LANE_XS[lane]
      star.y      = -20
      star.color  = STAR_COLORS[rngInt(STAR_COLORS.length)]
      star.rot    = 0
      star.rotSpd = rng(-0.05, 0.05)
      star.active = true
    }

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; setPhase('playing'); return }
      if (curPhase !== 'playing') return
      activeLane = hlIndex   // move basket to scan-highlighted position
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++

      // Advance scan highlight
      if (frame % framesPerScan === 0) hlIndex = (hlIndex + 1) % 3

      // Smooth basket toward active lane
      basketX += (LANE_XS[activeLane] - basketX) * 0.14

      if (star.active) {
        star.y   += fallSpeed
        star.rot += star.rotSpd

        // Catch check: star reaches basket zone
        if (star.y >= BASKET_Y - 12 && star.y <= BASKET_Y + BASKET_H) {
          if (Math.abs(star.x - basketX) < BASKET_W / 2 + 12) {
            star.active = false
            catchAnim   = 50
            curScore++; setScore(curScore)
            waitTimer   = respawnDelay()
          }
        }
        // Fell past bottom
        if (star.y > H + 20) {
          star.active = false
          missBlink   = 25
          waitTimer   = respawnDelay()
        }
      } else {
        if (catchAnim > 0) catchAnim--
        if (missBlink > 0) missBlink--
        waitTimer--
        if (waitTimer <= 0) spawnStar()
      }
    }

    function draw() {
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#060c1a'); sky.addColorStop(1, '#0e2040')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

      // Background stars
      for (const s of bgStars) {
        ctx.globalAlpha = s.a
        ctx.fillStyle   = '#fff'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Lane guide lines
      LANE_XS.forEach((lx) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth   = 1.5
        ctx.setLineDash([6, 10])
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, BASKET_Y); ctx.stroke()
        ctx.setLineDash([])
      })

      // Miss blink at bottom edge
      if (missBlink > 0) {
        ctx.fillStyle = `rgba(239,68,68,${missBlink / 25 * 0.3})`
        ctx.fillRect(0, H - 14, W, 14)
      }

      // Falling star (with glow)
      if (star.active) {
        ctx.save()
        // Alignment glow: brightens when star is above the basket's lane
        const aligned = Math.abs(star.x - basketX) < BASKET_W / 2 + 12
        if (aligned) {
          ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 18
        }
        ctx.translate(star.x, star.y)
        ctx.rotate(star.rot)
        ctx.globalAlpha = 0.25
        ctx.fillStyle = star.color
        ctx.beginPath(); ctx.arc(0, 0, 16 * 1.8, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        drawStarShape(ctx, 0, 0, 14, star.color)
        ctx.restore()
        ctx.shadowBlur = 0
      }

      // Basket shadow positions (all 3 shown as ghost outlines)
      LANE_XS.forEach((lx, i) => {
        const isHl = i === hlIndex
        ctx.globalAlpha = 0.18
        ctx.fillStyle   = '#3b82f6'
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(lx - BASKET_W / 2, BASKET_Y, BASKET_W, BASKET_H, 6)
        else ctx.rect(lx - BASKET_W / 2, BASKET_Y, BASKET_W, BASKET_H)
        ctx.fill()
        ctx.globalAlpha = 1

        if (isHl) {
          ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2.5
          ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 12
          ctx.beginPath()
          if (ctx.roundRect) ctx.roundRect(lx - BASKET_W / 2, BASKET_Y, BASKET_W, BASKET_H, 6)
          else ctx.rect(lx - BASKET_W / 2, BASKET_Y, BASKET_W, BASKET_H)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      })

      // Real basket (bright, at basketX)
      const bx = basketX - BASKET_W / 2
      ctx.fillStyle = catchAnim > 0 ? '#22c55e' : '#3b82f6'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx, BASKET_Y, BASKET_W, BASKET_H, 6)
      else ctx.rect(bx, BASKET_Y, BASKET_W, BASKET_H)
      ctx.fill()
      // Rim
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx + 4, BASKET_Y + 3, BASKET_W - 8, 7, 3)
      else ctx.rect(bx + 4, BASKET_Y + 3, BASKET_W - 8, 7)
      ctx.fill()
      // Arrow indicator on basket
      ctx.fillStyle   = 'rgba(255,255,255,0.8)'
      ctx.font        = 'bold 13px Nunito, system-ui'
      ctx.textAlign   = 'center'
      ctx.fillText('⬆', basketX, BASKET_Y + 20)
      ctx.textAlign   = 'left'

      // Catch sparkles
      if (catchAnim > 0) {
        const alpha = catchAnim / 50
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 16px Nunito, system-ui'
        ctx.textAlign = 'center'
        ctx.fillText('⭐ +1', basketX, BASKET_Y - 12)
        ctx.globalAlpha = 1
      }

      // Score HUD
      ctx.font = 'bold 15px Nunito, system-ui'; ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(`${curScore} ★`, W - 12, 22)
      ctx.textAlign = 'left'

      // Overlays
      if (curPhase === 'waiting') {
        ctx.fillStyle = 'rgba(6,12,26,0.82)'; ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Nunito, system-ui'
        ctx.fillText('Star Catcher ⭐', W / 2, H / 2 - 30)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 16px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 2)
        ctx.fillStyle = '#64748b'; ctx.font = '13px Nunito, system-ui'
        ctx.fillText('Press SPACE to move the basket to the glowing position', W / 2, H / 2 + 26)
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
          <h1 className="text-lg font-black text-white leading-none">⭐ Star Catcher</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space to move basket to the glowing position</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#FFD700]">{score} ⭐</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Star Catcher game canvas" />
      </main>
    </div>
  )
}
