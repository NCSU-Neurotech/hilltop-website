/**
 * Balloon Float — redesigned for single-switch accessibility.
 *
 * A colourful balloon hovers at the bottom of the screen in one of 3 lanes.
 * Collectables (stars, hearts, etc.) float down slowly from the top.
 * Three lane selector buttons at the bottom auto-scan at the child's speed.
 * Press SPACE to move the balloon to the highlighted lane.
 * Catch a collectable = score++. No lives, no failure — purely rewarding.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { playCatchSound, playClickSound } from '../utils/audio'

const W = 480
const H = 420
const LANE_XS   = [96, 240, 384]   // left / center / right lane X positions
const BALLOON_Y = H - 100          // balloon basket top
const CATCH_Y   = BALLOON_Y - 10   // detection band
const CATCH_DX  = 54               // horizontal catch radius

const BALLOON_COLORS  = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899']
const ITEM_EMOJIS     = ['⭐','💖','🍀','🌸','🎁','✨','🌈','🍎','💛','🦋']
const LANE_COLORS     = ['#ef4444','#22c55e','#3b82f6']

function rngInt(n) { return Math.floor(Math.random() * n) }

export default function BalloonFloat() {
  const { childId }  = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs  = scanProfile.scanSpeedMs

  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const framesPerScan = Math.max(24, Math.round(scanSpeedMs / 16.7))
    // Star fall speed: star takes 4 full scan cycles to reach balloon → easy to react
    const fallSpeed = Math.max(0.5, (BALLOON_Y * 16.7) / (scanSpeedMs * 4))

    const balloonColor = BALLOON_COLORS[rngInt(BALLOON_COLORS.length)]

    let hlIndex     = 0           // which lane selector is scan-highlighted (0-2)
    let activeLane  = 1           // balloon is in this lane
    let balloonX    = LANE_XS[1]  // smooth x position
    let frame       = 0
    let curScore    = 0
    let curPhase    = 'waiting'

    // Item state
    let item = { x: LANE_XS[1], y: -40, emoji: '⭐', active: false }
    let respawnTimer  = framesPerScan * 2   // wait before first item
    let catchFlash    = 0                   // frames of catch celebration
    let catchX        = 0

    function spawnItem() {
      const lane = rngInt(3)
      item.x     = LANE_XS[lane]
      item.y     = -40
      item.emoji = ITEM_EMOJIS[rngInt(ITEM_EMOJIS.length)]
      item.active = true
    }

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; playClickSound(); return }
      if (curPhase !== 'playing') return
      // Move balloon to highlighted lane
      activeLane = hlIndex
      playClickSound()
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++

      // Advance scan highlight
      if (frame % framesPerScan === 0) hlIndex = (hlIndex + 1) % 3

      // Smooth balloon toward active lane
      balloonX += (LANE_XS[activeLane] - balloonX) * 0.14

      // Item
      if (item.active) {
        item.y += fallSpeed

        // Catch check
        if (item.y >= CATCH_Y - 20 && item.y <= CATCH_Y + 40) {
          if (Math.abs(item.x - balloonX) < CATCH_DX) {
            item.active  = false
            catchFlash   = 50
            catchX       = balloonX
            curScore++
            setScore(curScore)
            respawnTimer = Math.round(framesPerScan * 1.8)
            playCatchSound()
          }
        }
        // Fell past bottom
        if (item.y > H + 40) {
          item.active  = false
          respawnTimer = Math.round(framesPerScan * 1.5)
        }
      } else {
        if (catchFlash > 0) catchFlash--
        respawnTimer--
        if (respawnTimer <= 0) spawnItem()
      }
    }

    // ── Drawing helpers ───────────────────────────────────────

    function drawBalloon(cx, cy, color) {
      // Glow
      ctx.globalAlpha = 0.22
      ctx.fillStyle   = color
      ctx.beginPath(); ctx.arc(cx, cy, 46, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1

      // Body
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill()

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath(); ctx.arc(cx - 11, cy - 12, 12, 0, Math.PI * 2); ctx.fill()

      // Knot
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(cx, cy + 38, 5, 0, Math.PI * 2); ctx.fill()

      // String
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cx, cy + 43)
      for (let i = 0; i <= 5; i++) {
        const t = i / 5
        ctx.lineTo(cx + Math.sin(t * Math.PI * 3) * 5, cy + 43 + t * 36)
      }
      ctx.stroke()
    }

    function drawLaneSelectors() {
      const sy = H - 28
      LANE_XS.forEach((lx, i) => {
        const isHl   = i === hlIndex
        const isActive = i === activeLane
        const col    = LANE_COLORS[i]

        // Background circle
        ctx.globalAlpha = isActive ? 0.35 : 0.12
        ctx.fillStyle   = col
        ctx.beginPath(); ctx.arc(lx, sy, 22, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1

        // Border
        if (isHl) {
          ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3
          ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 14
          ctx.beginPath(); ctx.arc(lx, sy, 23, 0, Math.PI * 2); ctx.stroke()
          ctx.shadowBlur = 0
        } else {
          ctx.strokeStyle = col + '88'; ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(lx, sy, 22, 0, Math.PI * 2); ctx.stroke()
        }

        // Arrow pointing up
        ctx.fillStyle = isHl ? '#FFD700' : (isActive ? '#fff' : col + 'cc')
        ctx.font      = 'bold 14px Nunito, system-ui'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('▲', lx, sy)
        ctx.textBaseline = 'alphabetic'
      })
    }

    function draw() {
      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#040c20'); sky.addColorStop(1, '#0f2848')
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H)

      // Background stars
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137 + 11) % W
        const sy = (i * 89  + 19) % (H - 90)
        ctx.globalAlpha = 0.3 + (i % 5) * 0.1
        ctx.fillStyle   = '#fff'
        ctx.beginPath(); ctx.arc(sx, sy, 0.9, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Lane guide lines (faint vertical dashes)
      LANE_XS.forEach((lx, i) => {
        ctx.strokeStyle = LANE_COLORS[i] + '25'
        ctx.lineWidth   = 2
        ctx.setLineDash([8, 12])
        ctx.beginPath(); ctx.moveTo(lx, 20); ctx.lineTo(lx, H - 56); ctx.stroke()
        ctx.setLineDash([])
      })

      if (curPhase === 'waiting') {
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Balloon Float 🎈', W / 2, H / 2 - 60)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 - 22)
        ctx.fillStyle = '#94a3b8'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE to move the balloon under a falling star', W / 2, H / 2 + 8)
        ctx.textAlign = 'left'
        // Draw example balloon
        drawBalloon(W / 2, H / 2 + 66, balloonColor)
        return
      }

      // Falling item
      if (item.active) {
        ctx.font = '38px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        // Glow when balloon is aligned
        if (Math.abs(item.x - balloonX) < CATCH_DX && item.y > H / 4) {
          ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 20
        }
        ctx.fillText(item.emoji, item.x, item.y)
        ctx.shadowBlur = 0; ctx.textBaseline = 'alphabetic'
      }

      // Catch flash
      if (catchFlash > 0) {
        const alpha = catchFlash / 50
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 26px Nunito, system-ui'; ctx.textAlign = 'center'
        ctx.fillText('⭐ Caught! ⭐', catchX, BALLOON_Y - 54)
        ctx.globalAlpha = 1
      }

      // Balloon
      drawBalloon(balloonX, BALLOON_Y - 14, balloonColor)

      // Lane selectors
      drawLaneSelectors()

      // Score HUD
      ctx.font = 'bold 16px Nunito, system-ui'; ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.fillText(`${curScore} caught!`, W - 14, 26)
      ctx.textAlign = 'left'

      // Hint
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.font = '13px Nunito, system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('Press SPACE to move balloon to glowing lane', W / 2, H - 56)
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
          <h1 className="text-lg font-black text-white leading-none">🎈 Balloon Float</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space to move balloon under falling items</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#f97316]">{score} ⭐</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Balloon Float game canvas" />
      </main>
    </div>
  )
}
