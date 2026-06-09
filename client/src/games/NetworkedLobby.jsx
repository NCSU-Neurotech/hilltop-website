/**
 * Networked Pong — /dashboard/child/:childId/games/online
 *
 * Two players on DIFFERENT devices play Pong via a 4-digit room code.
 * Single-switch control: each player's paddle auto-oscillates up/down.
 * SPACEBAR reverses the paddle's direction. First to 5 points wins.
 *
 * Architecture:
 *   P1 (host) runs the authoritative game loop and broadcasts state at ~30fps.
 *   P2 sends spacebar input events; P1 applies them, P2 renders received state.
 *   No server changes needed — uses the existing generic game-event relay.
 *
 * Phases: connecting → lobby → waiting → ready → countdown → playing → gameover
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

// ── Canvas constants ──────────────────────────────────────────────────────────
const CW           = 600
const CH           = 400
const PADDLE_W     = 16
const PADDLE_H     = 110            // tall paddle — easier to hit with
const BALL_R       = 10
const PADDLE_SPEED = 1.6            // slow oscillation — children have time to react
const WINNING_SCORE = 5
const P1_X         = 24
const P2_X         = CW - 24 - PADDLE_W
const PAUSE_FRAMES = 180            // ~3 s pause after scoring — time to understand what happened

function makeBall(serveRight = true) {
  const angle = (Math.random() * 24 - 12) * (Math.PI / 180) // ±12° — flatter trajectory
  const speed = 2.2                 // slow starting speed
  return {
    x: CW / 2, y: CH / 2,
    vx: serveRight ?  speed * Math.cos(angle) : -speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
  }
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function NetworkedLobby() {
  const { childId } = useParams()

  const [phase,      setPhase]      = useState('connecting')
  const [role,       setRole]       = useState(null)        // 'p1' | 'p2'
  const [roomCode,   setRoomCode]   = useState('')
  const [joinInput,  setJoinInput]  = useState('')
  const [joinError,  setJoinError]  = useState('')
  const [scores,     setScores]     = useState({ p1: 0, p2: 0 })
  const [winner,     setWinner]     = useState(null)        // 'p1' | 'p2'
  const [countdown,  setCountdown]  = useState(null)
  const [connError,  setConnError]  = useState('')

  const socketRef  = useRef(null)
  const canvasRef  = useRef(null)
  const gsRef      = useRef(null)    // P1 authoritative game state
  const p2StateRef = useRef(null)    // P2 latest received state
  const rafRef     = useRef(null)
  const phaseRef   = useRef(phase);  useEffect(() => { phaseRef.current = phase }, [phase])
  const roleRef    = useRef(role);   useEffect(() => { roleRef.current  = role  }, [role])

  // ── Connect ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SERVER_URL, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect',       () => setPhase('lobby'))
    socket.on('connect_error', () => { setConnError('Cannot reach server.'); setPhase('error') })
    socket.on('room-ready',    () => setPhase('ready'))

    socket.on('game-event', (event) => {
      // ── P2: receive full game state ──
      if (event.type === 'pong-state') {
        if (event.phase === 'countdown') {
          setCountdown(event.countdown)
          setScores(event.scores ?? { p1: 0, p2: 0 })
          setPhase('countdown')
          return
        }
        if (event.phase === 'playing') {
          p2StateRef.current = event
          setScores(event.scores)
          setCountdown(null)
          if (phaseRef.current !== 'playing') setPhase('playing')
          return
        }
        if (event.phase === 'gameover') {
          setWinner(event.winner)
          setScores(event.scores)
          setPhase('gameover')
          return
        }
        if (event.phase === 'reset') {
          setWinner(null)
          setScores({ p1: 0, p2: 0 })
          setPhase('ready')
          return
        }
      }

      // ── P1: receive input from P2 ──
      if (event.type === 'pong-input' && event.action === 'reverse') {
        if (gsRef.current) gsRef.current.p2dir *= -1
      }
    })

    socket.on('player-disconnected', () => {
      cancelAnimationFrame(rafRef.current)
      setConnError('Opponent disconnected.')
      setPhase('error')
    })

    return () => { socket.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [])

  // ── Room create / join ────────────────────────────────────────────────────
  const createRoom = useCallback(() => {
    socketRef.current?.emit('create-room', ({ code }) => {
      setRole('p1'); setRoomCode(code); setPhase('waiting')
    })
  }, [])

  const joinRoom = useCallback(() => {
    const code = joinInput.trim()
    if (!/^\d{4}$/.test(code)) { setJoinError('Enter a 4-digit code.'); return }
    socketRef.current?.emit('join-room', code, (res) => {
      if (res.error) { setJoinError(res.error); return }
      setRole('p2'); setRoomCode(code); setJoinError('')
    })
  }, [joinInput])

  // ── P1: countdown → start ─────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    let n = 3
    const emit = (n) => socketRef.current?.emit('game-event', {
      type: 'pong-state', phase: 'countdown', countdown: n, scores: { p1: 0, p2: 0 },
    })
    setCountdown(n); setPhase('countdown'); emit(n)
    const iv = setInterval(() => {
      n--
      if (n > 0) { setCountdown(n); emit(n) }
      else {
        clearInterval(iv); setCountdown(null)
        launchGame()
      }
    }, 1000)
  }, [])

  function launchGame() {
    const init = { p1: 0, p2: 0 }
    gsRef.current = {
      ball: makeBall(true),
      p1y: CH / 2 - PADDLE_H / 2,
      p2y: CH / 2 - PADDLE_H / 2,
      p1dir: 1, p2dir: 1,
      scores: init,
      pauseFrames: 0,
      lastScorer: null,
    }
    setScores(init)
    setPhase('playing')
    socketRef.current?.emit('game-event', { type: 'pong-state', phase: 'playing', scores: init })
  }

  function resetGame() {
    setWinner(null); setScores({ p1: 0, p2: 0 }); setPhase('ready')
    socketRef.current?.emit('game-event', { type: 'pong-state', phase: 'reset' })
  }

  // ── Spacebar ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      const ph = phaseRef.current
      const rl = roleRef.current

      if (ph === 'ready'     && rl === 'p1') { startCountdown(); return }
      if (ph === 'gameover'  && rl === 'p1') { resetGame(); return }
      if (ph !== 'playing') return

      if (rl === 'p1') {
        if (gsRef.current) gsRef.current.p1dir *= -1
      } else {
        socketRef.current?.emit('game-event', { type: 'pong-input', action: 'reverse' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startCountdown])

  // ── P1 game loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || role !== 'p1') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0

    function loop() {
      rafRef.current = requestAnimationFrame(loop)
      const gs = gsRef.current
      if (!gs) return

      // Pause after score
      if (gs.pauseFrames > 0) {
        gs.pauseFrames--
        if (gs.pauseFrames === 0) {
          gs.ball = makeBall(gs.lastScorer === 'p1') // serve toward last scorer
        }
        drawCanvas(ctx, gs, 'p1', true)
        return
      }

      // Move paddles (oscillate, reverse at edges)
      gs.p1y += gs.p1dir * PADDLE_SPEED
      gs.p2y += gs.p2dir * PADDLE_SPEED
      if (gs.p1y <= 0)             { gs.p1y = 0;             gs.p1dir =  1 }
      if (gs.p1y >= CH - PADDLE_H) { gs.p1y = CH - PADDLE_H; gs.p1dir = -1 }
      if (gs.p2y <= 0)             { gs.p2y = 0;             gs.p2dir =  1 }
      if (gs.p2y >= CH - PADDLE_H) { gs.p2y = CH - PADDLE_H; gs.p2dir = -1 }

      // Move ball
      const b = gs.ball
      b.x += b.vx;  b.y += b.vy

      // Top / bottom wall bounce
      if (b.y - BALL_R <= 0)  { b.y = BALL_R;       b.vy =  Math.abs(b.vy) }
      if (b.y + BALL_R >= CH) { b.y = CH - BALL_R;  b.vy = -Math.abs(b.vy) }

      // Cap speed — never gets faster than 5 px/frame so it stays readable
      const spd = Math.hypot(b.vx, b.vy)
      if (spd > 5) { b.vx = b.vx / spd * 5; b.vy = b.vy / spd * 5 }

      // P1 paddle collision
      if (b.vx < 0 && b.x - BALL_R <= P1_X + PADDLE_W && b.x >= P1_X) {
        if (b.y + BALL_R >= gs.p1y && b.y - BALL_R <= gs.p1y + PADDLE_H) {
          b.vx =  Math.abs(b.vx) * 1.03  // tiny speed-up per rally
          b.x  = P1_X + PADDLE_W + BALL_R
          b.vy = ((b.y - gs.p1y) / PADDLE_H - 0.5) * 4  // gentle angle
        }
      }

      // P2 paddle collision
      if (b.vx > 0 && b.x + BALL_R >= P2_X && b.x <= P2_X + PADDLE_W) {
        if (b.y + BALL_R >= gs.p2y && b.y - BALL_R <= gs.p2y + PADDLE_H) {
          b.vx = -Math.abs(b.vx) * 1.03
          b.x  = P2_X - BALL_R
          b.vy = ((b.y - gs.p2y) / PADDLE_H - 0.5) * 4
        }
      }

      // Scoring
      function score(who) {
        gs.scores[who]++
        gs.lastScorer = who
        gs.pauseFrames = PAUSE_FRAMES
        const snap = { ...gs.scores }
        setScores(snap)
        if (gs.scores[who] >= WINNING_SCORE) {
          setWinner(who); setPhase('gameover')
          socketRef.current?.emit('game-event', {
            type: 'pong-state', phase: 'gameover', winner: who, scores: snap,
          })
        }
      }
      if (b.x < -BALL_R)       score('p2')
      else if (b.x > CW + BALL_R) score('p1')

      drawCanvas(ctx, gs, 'p1', false)

      // Broadcast at ~30 fps
      if (frame % 2 === 0) {
        socketRef.current?.emit('game-event', {
          type: 'pong-state', phase: 'playing',
          ball: { ...b }, p1y: gs.p1y, p2y: gs.p2y, scores: { ...gs.scores },
        })
      }
      frame++
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, role])

  // ── P2 render loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || role !== 'p2') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function loop() {
      rafRef.current = requestAnimationFrame(loop)
      const st = p2StateRef.current
      if (!st) return
      const fakeGs = {
        ball:       st.ball  ?? { x: CW / 2, y: CH / 2, vx: 0, vy: 0 },
        p1y:        st.p1y   ?? CH / 2 - PADDLE_H / 2,
        p2y:        st.p2y   ?? CH / 2 - PADDLE_H / 2,
        scores:     st.scores ?? { p1: 0, p2: 0 },
        pauseFrames: 0,
      }
      drawCanvas(ctx, fakeGs, 'p2', false)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, role])

  // ── Render ────────────────────────────────────────────────────────────────
  const myScore  = role === 'p1' ? scores.p1 : scores.p2
  const oppScore = role === 'p1' ? scores.p2 : scores.p1
  const iWon     = (winner === 'p1' && role === 'p1') || (winner === 'p2' && role === 'p2')

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        <Link to={`/dashboard/child/${childId}/games`}
          className="text-slate-400 hover:text-white text-sm font-semibold">
          ← Games
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-black text-white leading-none">🏓 Networked Pong</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {roomCode ? `Room ${roomCode}` : 'Cross-device multiplayer'}&nbsp;
            {role === 'p1' ? '· You are P1 (left)' : role === 'p2' ? '· You are P2 (right)' : ''}
          </p>
        </div>
        {(phase === 'playing' || phase === 'gameover') && (
          <div className="text-xl font-black text-white tabular-nums">
            {myScore} – {oppScore}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 text-center select-none">

        {/* CONNECTING */}
        {phase === 'connecting' && (
          <>
            <div className="w-10 h-10 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin" />
            <p className="text-slate-400">Connecting to server…</p>
          </>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <>
            <div className="text-7xl">⚠️</div>
            <h2 className="text-2xl font-black text-white">Connection lost</h2>
            <p className="text-slate-400">{connError || 'Please reload to reconnect.'}</p>
            <Link to={`/dashboard/child/${childId}/games`}
              className="mt-4 px-6 h-11 rounded-xl bg-[#1e293b] text-white text-sm font-semibold
                         border border-slate-600 hover:border-slate-400 transition-colors inline-flex items-center">
              ← Back to Games
            </Link>
          </>
        )}

        {/* LOBBY */}
        {phase === 'lobby' && (
          <>
            <div className="text-7xl">🏓</div>
            <h2 className="text-2xl font-black text-white">Play Pong on Two Devices</h2>
            <p className="text-slate-400 text-base max-w-xs">
              One player creates a room and shares the 4-digit code.
              The other player joins with that code.
              <br /><span className="text-[#FFD700] font-semibold">SPACE</span> reverses your paddle.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 mt-2 w-full max-w-md">
              <div className="flex-1 bg-[#1e293b] rounded-2xl p-5 border border-slate-700 flex flex-col gap-3">
                <p className="text-white font-black text-base">Host a Game</p>
                <p className="text-slate-400 text-sm">Create a room and share the code</p>
                <button onClick={createRoom}
                  className="w-full h-11 rounded-xl bg-[#3b82f6] text-white font-black text-sm
                             hover:bg-blue-500 transition-colors">
                  Create Room
                </button>
              </div>
              <div className="flex-1 bg-[#1e293b] rounded-2xl p-5 border border-slate-700 flex flex-col gap-3">
                <p className="text-white font-black text-base">Join a Game</p>
                <input
                  type="text" inputMode="numeric" maxLength={4}
                  placeholder="Enter 4-digit code"
                  value={joinInput}
                  onChange={(e) => { setJoinInput(e.target.value); setJoinError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                  className="h-11 rounded-xl bg-slate-900 border border-slate-600 text-white px-3
                             text-center text-xl tracking-widest font-mono
                             focus:outline-none focus:border-[#FFD700]"
                />
                {joinError && <p className="text-red-400 text-xs">{joinError}</p>}
                <button onClick={joinRoom}
                  className="w-full h-11 rounded-xl bg-[#a855f7] text-white font-black text-sm
                             hover:bg-purple-500 transition-colors">
                  Join Room
                </button>
              </div>
            </div>
          </>
        )}

        {/* WAITING FOR P2 */}
        {phase === 'waiting' && (
          <>
            <div className="text-7xl animate-pulse">⏳</div>
            <h2 className="text-2xl font-black text-white">Waiting for opponent…</h2>
            <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Share this code:</p>
              <p className="text-[#FFD700] text-6xl font-black tracking-widest tabular-nums">
                {roomCode}
              </p>
            </div>
            <p className="text-slate-500 text-sm">Opponent goes to Games → Online Pong → Join</p>
          </>
        )}

        {/* READY */}
        {phase === 'ready' && (
          <>
            <div className="text-7xl">🤝</div>
            <h2 className="text-2xl font-black text-white">Both players connected!</h2>
            <p className="text-slate-400">First to {WINNING_SCORE} points wins</p>
            <div className="mt-3 bg-[#1e293b] rounded-2xl p-4 border border-slate-700 max-w-xs text-sm text-slate-300">
              Your paddle auto-moves up and down.<br />
              Press <span className="text-[#FFD700] font-bold">SPACE</span> to reverse its direction and hit the ball.
            </div>
            {role === 'p1'
              ? <p className="text-[#FFD700] font-bold animate-pulse mt-2">Press SPACE to start</p>
              : <p className="text-slate-400 mt-2">Waiting for host to start…</p>
            }
          </>
        )}

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <>
            <div className="text-9xl font-black text-[#FFD700] tabular-nums">{countdown}</div>
            <p className="text-slate-400 text-xl">Get ready…</p>
          </>
        )}

        {/* PLAYING — canvas */}
        {phase === 'playing' && (
          <div className="w-full max-w-2xl">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">
              <span style={{ color: role === 'p1' ? '#FFD700' : '#94a3b8' }}>
                {role === 'p1' ? '← You' : '← P1'}
              </span>
              <span style={{ color: role === 'p2' ? '#FFD700' : '#94a3b8' }}>
                {role === 'p2' ? 'You →' : 'P2 →'}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width={CW}
              height={CH}
              className="w-full rounded-2xl border border-slate-700/60"
              style={{ aspectRatio: `${CW}/${CH}`, display: 'block' }}
            />
            <p className="text-slate-500 text-xs mt-2">
              Press <span className="text-[#FFD700] font-bold">SPACE</span> to reverse your paddle
            </p>
          </div>
        )}

        {/* GAMEOVER */}
        {phase === 'gameover' && (
          <>
            <div className="text-8xl">{iWon ? '🏆' : '😔'}</div>
            <h2 className="text-4xl font-black" style={{ color: iWon ? '#FFD700' : '#94a3b8' }}>
              {iWon ? 'You Win!' : 'Opponent Wins!'}
            </h2>
            <p className="text-white text-2xl font-bold tabular-nums">{myScore} – {oppScore}</p>
            {role === 'p1'
              ? <p className="text-[#FFD700] font-bold animate-pulse mt-6">Press SPACE to play again</p>
              : <p className="text-slate-400 mt-6">Waiting for host to restart…</p>
            }
          </>
        )}

      </main>
    </div>
  )
}

// ── Canvas draw ───────────────────────────────────────────────────────────────
function drawCanvas(ctx, gs, myRole, isPaused) {
  // Background
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, CW, CH)

  // Center dashed line
  ctx.save()
  ctx.setLineDash([10, 10])
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(CW / 2, 0); ctx.lineTo(CW / 2, CH); ctx.stroke()
  ctx.restore()

  // Paddles — your paddle is gold, opponent's is slate
  const myPaddleColor  = '#FFD700'
  const oppPaddleColor = '#475569'
  const p1Color = myRole === 'p1' ? myPaddleColor : oppPaddleColor
  const p2Color = myRole === 'p2' ? myPaddleColor : oppPaddleColor

  ctx.fillStyle = p1Color
  drawRoundRect(ctx, P1_X, gs.p1y, PADDLE_W, PADDLE_H, 5)
  ctx.fill()

  ctx.fillStyle = p2Color
  drawRoundRect(ctx, P2_X, gs.p2y, PADDLE_W, PADDLE_H, 5)
  ctx.fill()

  // Ball (hidden during pause, flashes gold on score)
  if (!isPaused) {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(gs.ball.x, gs.ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // Flash gold dot in center to signal a score
    if (Math.floor(Date.now() / 180) % 2 === 0) {
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(CW / 2, CH / 2, BALL_R + 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Scores
  const myS  = myRole === 'p1' ? gs.scores.p1 : gs.scores.p2
  const oppS = myRole === 'p1' ? gs.scores.p2 : gs.scores.p1

  ctx.font = 'bold 52px Nunito, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFD700'
  ctx.fillText(myS, myRole === 'p1' ? CW / 4 : (CW * 3) / 4, 60)
  ctx.fillStyle = '#334155'
  ctx.fillText(oppS, myRole === 'p1' ? (CW * 3) / 4 : CW / 4, 60)
}

function drawRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
