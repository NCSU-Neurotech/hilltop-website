/**
 * Same-Screen Pong — /dashboard/child/:childId/games/pong
 *
 * Two players share one device.
 *   Player 1 (left  paddle) — SPACEBAR
 *   Player 2 (right paddle) — ENTER
 *
 * Each paddle moves continuously, bouncing between the top and bottom walls.
 * Pressing your key reverses the paddle's direction (identical to Star Catcher).
 * Ball speeds up slightly with each paddle hit. First to WIN_SCORE wins.
 *
 * All game state lives in the useEffect closure (no stale-ref problems).
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const W              = 560
const H              = 380
const PADDLE_W       = 13
const PADDLE_H       = 86
const BALL_R         = 9
const PADDLE_SPEED   = 3.6   // px / frame
const BALL_SPEED_0   = 4.2   // initial px / frame (per axis component)
const BALL_SPEED_MAX = 9.0
const WIN_SCORE      = 7
const SERVE_PAUSE    = 80    // frames after scoring before countdown

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randSign() { return Math.random() > 0.5 ? 1 : -1 }

function makeBall(serveRight) {
  const angle = (Math.random() - 0.5) * (Math.PI / 5)
  const dir   = serveRight ? 1 : -1
  return {
    x:     W / 2,
    y:     H / 2,
    vx:    BALL_SPEED_0 * dir * Math.cos(angle),
    vy:    BALL_SPEED_0 * Math.sin(angle) * randSign(),
    speed: BALL_SPEED_0,
  }
}

function drawRR(ctx, x, y, w, h, r) {
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Pong() {
  const { childId }        = useParams()
  const canvasRef          = useRef(null)
  const [score, setScore]  = useState({ p1: 0, p2: 0 })
  const [phase, setPhase]  = useState('waiting')
  const [winner, setWinner]= useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    // ── Mutable game state ──────────────────────────────────
    const p1  = { y: H / 2 - PADDLE_H / 2, dir: 1 }
    const p2  = { y: H / 2 - PADDLE_H / 2, dir: 1 }
    let ball  = makeBall(true)
    let s1 = 0, s2 = 0
    let curPhase  = 'waiting'  // waiting | countdown | playing | scored | gameover
    let cdFrame   = 0          // frames elapsed in countdown
    let pauseTimer = 0
    let curWinner  = null

    function resetPaddles() {
      p1.y = H / 2 - PADDLE_H / 2; p1.dir = 1
      p2.y = H / 2 - PADDLE_H / 2; p2.dir = 1
    }

    // ── Input ──────────────────────────────────────────────
    function onKey(e) {
      const isSpace = e.code === 'Space'
      const isEnter = e.code === 'Enter'
      if (!isSpace && !isEnter) return
      e.preventDefault()

      if (curPhase === 'waiting') {
        curPhase = 'countdown'; cdFrame = 0; setPhase('countdown')
        return
      }
      if (curPhase === 'playing') {
        if (isSpace) p1.dir *= -1
        if (isEnter) p2.dir *= -1
        return
      }
      if (curPhase === 'gameover') {
        s1 = 0; s2 = 0; curWinner = null
        setScore({ p1: 0, p2: 0 }); setWinner(null)
        resetPaddles(); ball = makeBall(true)
        curPhase = 'countdown'; cdFrame = 0; setPhase('countdown')
      }
    }
    document.addEventListener('keydown', onKey)

    // ── Update ────────────────────────────────────────────
    function update() {
      if (curPhase === 'countdown') {
        cdFrame++
        if (cdFrame >= 180) { curPhase = 'playing'; setPhase('playing') }
        return
      }

      if (curPhase === 'scored') {
        pauseTimer++
        if (pauseTimer >= SERVE_PAUSE) {
          pauseTimer = 0; curPhase = 'countdown'; cdFrame = 0; setPhase('countdown')
        }
        return
      }

      if (curPhase !== 'playing') return

      // Paddles (bounce off walls)
      p1.y += PADDLE_SPEED * p1.dir
      p2.y += PADDLE_SPEED * p2.dir
      if (p1.y <= 0)             { p1.y = 0;            p1.dir =  1 }
      if (p1.y + PADDLE_H >= H)  { p1.y = H - PADDLE_H; p1.dir = -1 }
      if (p2.y <= 0)             { p2.y = 0;            p2.dir =  1 }
      if (p2.y + PADDLE_H >= H)  { p2.y = H - PADDLE_H; p2.dir = -1 }

      // Ball movement
      ball.x += ball.vx; ball.y += ball.vy

      // Top / bottom walls
      if (ball.y - BALL_R <= 0)  { ball.y = BALL_R;      ball.vy =  Math.abs(ball.vy) }
      if (ball.y + BALL_R >= H)  { ball.y = H - BALL_R;  ball.vy = -Math.abs(ball.vy) }

      // Left paddle (P1) — x = 18
      const P1_FACE = 18 + PADDLE_W
      if (ball.vx < 0 && ball.x - BALL_R <= P1_FACE &&
          ball.y >= p1.y - BALL_R && ball.y <= p1.y + PADDLE_H + BALL_R) {
        ball.x = P1_FACE + BALL_R
        const hit  = (ball.y - (p1.y + PADDLE_H / 2)) / (PADDLE_H / 2)
        const spd  = Math.min(ball.speed * 1.06, BALL_SPEED_MAX)
        const ang  = hit * (Math.PI / 4)
        ball.vx    = spd * Math.cos(ang)
        ball.vy    = spd * Math.sin(ang)
        ball.speed = spd
      }

      // Right paddle (P2) — x = W - 18 - PADDLE_W
      const P2_FACE = W - 18 - PADDLE_W
      if (ball.vx > 0 && ball.x + BALL_R >= P2_FACE &&
          ball.y >= p2.y - BALL_R && ball.y <= p2.y + PADDLE_H + BALL_R) {
        ball.x = P2_FACE - BALL_R
        const hit  = (ball.y - (p2.y + PADDLE_H / 2)) / (PADDLE_H / 2)
        const spd  = Math.min(ball.speed * 1.06, BALL_SPEED_MAX)
        const ang  = hit * (Math.PI / 4)
        ball.vx    = -spd * Math.cos(ang)
        ball.vy    =  spd * Math.sin(ang)
        ball.speed = spd
      }

      // Score left
      if (ball.x < -BALL_R) {
        s2++; setScore({ p1: s1, p2: s2 })
        resetPaddles(); ball = makeBall(true)
        if (s2 >= WIN_SCORE) { curWinner = 2; setWinner(2); curPhase = 'gameover'; setPhase('gameover') }
        else { curPhase = 'scored'; setPhase('scored'); pauseTimer = 0 }
      }
      // Score right
      if (ball.x > W + BALL_R) {
        s1++; setScore({ p1: s1, p2: s2 })
        resetPaddles(); ball = makeBall(false)
        if (s1 >= WIN_SCORE) { curWinner = 1; setWinner(1); curPhase = 'gameover'; setPhase('gameover') }
        else { curPhase = 'scored'; setPhase('scored'); pauseTimer = 0 }
      }
    }

    // ── Draw ─────────────────────────────────────────────
    function draw() {
      ctx.fillStyle = '#080e1f'
      ctx.fillRect(0, 0, W, H)

      // Centre line
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth   = 2
      ctx.setLineDash([8, 8])
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.setLineDash([])

      // Paddles
      ctx.fillStyle = '#fff'
      ctx.beginPath(); drawRR(ctx, 18, p1.y, PADDLE_W, PADDLE_H, 4); ctx.fill()
      ctx.beginPath(); drawRR(ctx, W - 18 - PADDLE_W, p2.y, PADDLE_W, PADDLE_H, 4); ctx.fill()

      // Direction arrows on paddles
      ctx.font        = 'bold 10px system-ui'
      ctx.textAlign   = 'center'
      ctx.fillStyle   = 'rgba(0,0,0,0.4)'
      ctx.fillText(p1.dir > 0 ? '↓' : '↑', 18 + PADDLE_W / 2, p1.y + PADDLE_H / 2 + 4)
      ctx.fillText(p2.dir > 0 ? '↓' : '↑', W - 18 - PADDLE_W / 2, p2.y + PADDLE_H / 2 + 4)

      // Ball
      if (curPhase === 'playing' || curPhase === 'scored') {
        ctx.globalAlpha = 0.28
        ctx.fillStyle   = '#fff'
        ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R * 2.2, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
        ctx.fillStyle   = '#fff'
        ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2); ctx.fill()
      }

      // Score
      ctx.textAlign   = 'center'
      ctx.font        = 'bold 30px Nunito, system-ui'
      ctx.fillStyle   = 'rgba(255,255,255,0.9)'
      ctx.fillText(String(s1), W / 2 - 42, 42)
      ctx.fillStyle   = 'rgba(255,255,255,0.35)'
      ctx.fillText(':', W / 2, 42)
      ctx.fillStyle   = 'rgba(255,255,255,0.9)'
      ctx.fillText(String(s2), W / 2 + 42, 42)

      // Player key labels
      ctx.font        = '11px Nunito, system-ui'
      ctx.fillStyle   = 'rgba(255,255,255,0.4)'
      ctx.fillText('P1  ·  Space', 60, 16)
      ctx.fillText('P2  ·  Enter', W - 60, 16)
      ctx.textAlign   = 'left'

      // ── Overlays ───────────────────────────────────────
      if (curPhase === 'waiting') {
        ctx.fillStyle = 'rgba(8,14,31,0.86)'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff';    ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Pong 🏓', W / 2, H / 2 - 44)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 15px Nunito, system-ui'
        ctx.fillText('P1 uses SPACE  ·  P2 uses ENTER', W / 2, H / 2 - 6)
        ctx.fillStyle = '#94a3b8'; ctx.font = '13px Nunito, system-ui'
        ctx.fillText(`Press any key to start  ·  First to ${WIN_SCORE} wins`, W / 2, H / 2 + 24)
        ctx.textAlign = 'left'
      }

      if (curPhase === 'countdown') {
        const num = 3 - Math.floor(cdFrame / 60)
        if (num >= 1) {
          ctx.globalAlpha = 0.18 + (1 - (cdFrame % 60) / 60) * 0.15
          ctx.fillStyle   = '#fff'
          ctx.font        = 'bold 140px Nunito, system-ui'
          ctx.textAlign   = 'center'
          ctx.fillText(String(num), W / 2, H / 2 + 50)
          ctx.globalAlpha = 1
          ctx.textAlign   = 'left'
        }
      }

      if (curPhase === 'gameover') {
        ctx.fillStyle = 'rgba(8,14,31,0.90)'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 28px Nunito, system-ui'
        ctx.fillText(`Player ${curWinner} Wins! 🏆`, W / 2, H / 2 - 28)
        ctx.fillStyle = '#fff';    ctx.font = 'bold 20px Nunito, system-ui'
        ctx.fillText(`${s1} – ${s2}`, W / 2, H / 2 + 10)
        ctx.fillStyle = '#64748b'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press any key to play again', W / 2, H / 2 + 42)
        ctx.textAlign = 'left'
      }
    }

    let raf
    function loop() { update(); draw(); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey) }
  }, [])

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        <Link to={`/dashboard/child/${childId}/games`}
          className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
          ← Games
        </Link>
        <div>
          <h1 className="text-lg font-black text-white leading-none">🏓 Pong</h1>
          <p className="text-slate-400 text-xs mt-0.5">P1: Space · P2: Enter · First to {WIN_SCORE} wins</p>
        </div>
        <div className="ml-auto">
          <span className="text-xl font-black text-white tabular-nums">
            {score.p1} – {score.p2}
          </span>
          {winner && (
            <span className="ml-3 text-[#FFD700] text-sm font-bold">
              Player {winner} wins! 🏆
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', imageRendering: 'auto', display: 'block' }}
          aria-label="Pong game canvas"
        />
      </main>
    </div>
  )
}
