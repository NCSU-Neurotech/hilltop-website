/**
 * Sky Jumper
 *
 * Auto-runner: the character runs left-to-right automatically.
 * Press SPACEBAR (or adaptive switch) to jump over obstacles.
 * Obstacle speed is tied to the child's scanSpeedMs profile setting —
 * slower reaction → slower obstacles, faster reaction → faster obstacles.
 *
 * Phases: 'waiting' → 'playing' → 'gameover'
 * All game state lives in a single useEffect closure to avoid stale refs.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

// ---------------------------------------------------------------------------
// Canvas constants (logical pixels)
// ---------------------------------------------------------------------------
const W          = 560
const H          = 220
const GROUND_Y   = 168   // y of the ground line
const PLAYER_X   = 88
const PLAYER_W   = 34
const PLAYER_H   = 34
const JUMP_VY    = -10.5
const GRAVITY    = 0.55
const MAX_FALL   = 14

// Speed & spawn derived from scanSpeedMs — tuned for single-switch accessibility
function obstacleSpeed(ms) {
  const t = (Math.min(Math.max(ms, 400), 2400) - 400) / 2000  // 0=fast, 1=slow
  return 3.2 - t * 1.8  // 3.2 → 1.4 px/frame (significantly slower)
}
function spawnInterval(speed) {
  return Math.round(130 - speed * 8)  // ~104–117 frames between obstacles (more breathing room)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rng(min, max) { return min + Math.random() * (max - min) }

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh, margin = 10) {
  return (
    ax + margin < bx + bw &&
    ax + aw - margin > bx &&
    ay + margin < by + bh &&
    ay + ah - margin > by
  )
}

function drawRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r) }
  else { ctx.rect(x, y, w, h) }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SkyJumper() {
  const { childId }  = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs  = scanProfile.scanSpeedMs

  const canvasRef    = useRef(null)
  const [score, setScore]   = useState(0)
  const [phase, setPhase]   = useState('waiting')

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    // ── Background stars (static) ──────────────────────────────
    const bgStars = Array.from({ length: 40 }, () => ({
      x: rng(0, W), y: rng(0, GROUND_Y - 10),
      r: rng(0.4, 1.6), a: rng(0.3, 0.9),
    }))

    // ── Mutable game state (closure, no React re-render needed) ─
    let player     = { x: PLAYER_X, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true }
    let obstacles  = []
    let frame      = 0
    let curScore   = 0
    let curPhase   = 'waiting'
    const speed    = obstacleSpeed(scanSpeedMs)
    const interval = spawnInterval(speed)

    function resetState() {
      player    = { x: PLAYER_X, y: GROUND_Y - PLAYER_H, vy: 0, onGround: true }
      obstacles = []
      frame     = 0
      curScore  = 0
    }

    // ── Input ─────────────────────────────────────────────────
    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') {
        curPhase = 'playing'; setPhase('playing')
      } else if (curPhase === 'playing' && player.onGround) {
        player.vy = JUMP_VY; player.onGround = false
      } else if (curPhase === 'gameover') {
        resetState(); curPhase = 'playing'; setPhase('playing'); setScore(0)
      }
    }
    document.addEventListener('keydown', handleKey)

    // ── Update ─────────────────────────────────────────────────
    function update() {
      if (curPhase !== 'playing') return
      frame++

      // Score
      const s = Math.floor(frame / 60)
      if (s !== curScore) { curScore = s; setScore(s) }

      // Player physics
      if (!player.onGround) {
        player.vy = Math.min(player.vy + GRAVITY, MAX_FALL)
        player.y += player.vy
      }
      if (player.y >= GROUND_Y - PLAYER_H) {
        player.y = GROUND_Y - PLAYER_H; player.vy = 0; player.onGround = true
      }

      // Spawn
      if (frame % interval === 0) {
        const h = rng(28, 65)
        obstacles.push({ x: W + 8, w: rng(22, 30), h, y: GROUND_Y - h })
      }

      // Move & cull
      obstacles.forEach(o => { o.x -= speed })
      obstacles = obstacles.filter(o => o.x + o.w > 0)

      // Collision
      for (const o of obstacles) {
        if (rectsOverlap(player.x, player.y, PLAYER_W, PLAYER_H, o.x, o.y, o.w, o.h)) {
          curPhase = 'gameover'; setPhase('gameover'); setScore(curScore); break
        }
      }
    }

    // ── Draw ───────────────────────────────────────────────────
    function draw() {
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y)
      sky.addColorStop(0, '#0b1d38')
      sky.addColorStop(1, '#1a3a6e')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      // Background stars
      for (const s of bgStars) {
        ctx.globalAlpha = s.a
        ctx.fillStyle   = '#fff'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Ground
      ctx.fillStyle = '#1a4a2e'
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y)
      ctx.fillStyle = '#2a7a4a'
      ctx.fillRect(0, GROUND_Y, W, 5)

      // Obstacles (red pillars)
      for (const o of obstacles) {
        ctx.fillStyle = '#b91c1c'
        ctx.beginPath(); drawRoundRect(ctx, o.x, o.y, o.w, o.h, 4); ctx.fill()
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(o.x, o.y, o.w, 5)
      }

      // Player
      const isOver  = curPhase === 'gameover'
      const playerColor = isOver ? '#64748b' : '#FFD700'
      ctx.fillStyle = playerColor
      ctx.beginPath(); drawRoundRect(ctx, player.x, player.y, PLAYER_W, PLAYER_H, 8); ctx.fill()

      // Shine on player
      if (!isOver) {
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.beginPath(); drawRoundRect(ctx, player.x + 4, player.y + 4, PLAYER_W - 12, 8, 4); ctx.fill()
      }

      // Eyes
      const eyeX = player.x + PLAYER_W - 11
      const eyeY = player.y + 11
      if (!isOver) {
        ctx.fillStyle = '#1e293b'
        ctx.beginPath(); ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(eyeX + 1, eyeY - 1, 1.5, 0, Math.PI * 2); ctx.fill()
      } else {
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(eyeX - 3, eyeY - 3); ctx.lineTo(eyeX + 3, eyeY + 3)
        ctx.moveTo(eyeX + 3, eyeY - 3); ctx.lineTo(eyeX - 3, eyeY + 3)
        ctx.stroke()
      }

      // Score HUD
      ctx.font = 'bold 15px Nunito, system-ui'; ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fillText(`${curScore}s`, W - 12, 22)
      ctx.textAlign = 'left'

      // Overlays
      if (curPhase === 'waiting') {
        ctx.fillStyle = 'rgba(10,18,40,0.78)'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Nunito, system-ui'
        ctx.fillText('Sky Jumper 🦅', W / 2, H / 2 - 22)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 16px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 10)
        ctx.fillStyle = '#64748b'; ctx.font = '13px Nunito, system-ui'
        ctx.fillText('Press space again to jump', W / 2, H / 2 + 34)
        ctx.textAlign = 'left'
      }

      if (curPhase === 'gameover') {
        ctx.fillStyle = 'rgba(10,18,40,0.82)'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Nice try! 🌟', W / 2, H / 2 - 24)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 18px Nunito, system-ui'
        ctx.fillText(`You survived ${curScore} second${curScore === 1 ? '' : 's'}!`, W / 2, H / 2 + 8)
        ctx.fillStyle = '#94a3b8'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE to play again', W / 2, H / 2 + 36)
        ctx.textAlign = 'left'
      }
    }

    // ── Loop ───────────────────────────────────────────────────
    let raf
    function loop() { update(); draw(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', handleKey) }
  }, [scanSpeedMs])   // re-init when child's speed setting changes

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
          <h1 className="text-lg font-black text-white leading-none">🦅 Sky Jumper</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space to jump</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#FFD700]">{score}s</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', imageRendering: 'auto', display: 'block' }}
          aria-label="Sky Jumper game canvas"
        />
      </main>
    </div>
  )
}
