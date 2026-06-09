/**
 * Rocket Launch
 *
 * A vertical power bar oscillates up and down.
 * A green "good zone" band is shown on the bar.
 * Press SPACE when the bar is inside the green zone to launch the rocket.
 * Score based on accuracy — very forgiving green zone.
 * Great cause-and-effect game for all ages.
 */
import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { playClickSound, playLaunchSound } from '../utils/audio'

const W = 480
const H = 360
const BAR_X = W / 2 - 16
const BAR_W = 32
const BAR_Y = 60
const BAR_H = 200
// Green zone: 35% to 70% of bar (generous band)
const ZONE_LO = 0.30
const ZONE_HI = 0.72

export default function RocketLaunch() {
  const { childId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const scanSpeedMs = scanProfile.scanSpeedMs

  const canvasRef  = useRef(null)
  const [score, setScore]   = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    // Bar oscillates at a speed derived from scanSpeedMs
    // Slower scanSpeedMs = slower oscillation = easier
    const cycleFrames = Math.max(60, Math.round(scanSpeedMs / 10))

    let curScore   = 0
    let curPhase   = 'waiting'
    let frame      = 0
    let barFrac    = 0      // 0 = bottom, 1 = top
    let launched   = false  // rocket flying animation
    let launchY    = H      // rocket y pos
    let launchScore = 0     // score from this launch
    let feedback   = 0      // frames of feedback animation
    let feedbackMsg = ''

    function getBarFrac() {
      // Sine oscillation: 0..1
      return (Math.sin((frame / cycleFrames) * Math.PI * 2) + 1) / 2
    }

    function inZone(frac) { return frac >= ZONE_LO && frac <= ZONE_HI }

    function calcScore(frac) {
      // Perfect centre of zone = 3, edges = 1
      const centre = (ZONE_LO + ZONE_HI) / 2
      const dist   = Math.abs(frac - centre) / ((ZONE_HI - ZONE_LO) / 2)
      if (dist < 0.2) return 3
      if (dist < 0.6) return 2
      return 1
    }

    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (curPhase === 'waiting') { curPhase = 'playing'; playClickSound(); return }
      if (curPhase !== 'playing' || launched || feedback > 0) return

      const frac = getBarFrac()
      if (inZone(frac)) {
        launchScore = calcScore(frac)
        curScore   += launchScore; setScore(curScore)
        launched    = true
        launchY     = H - 60
        feedbackMsg = launchScore === 3 ? 'Perfect! 🚀🌟' : launchScore === 2 ? 'Great launch! 🚀' : 'Good try! 🚀'
        feedback    = 80
        playLaunchSound()
      } else {
        feedbackMsg = 'Try the green zone! 💚'
        feedback    = 40
        playClickSound()
      }
    }
    document.addEventListener('keydown', handleKey)

    function update() {
      if (curPhase !== 'playing') return
      frame++
      barFrac = getBarFrac()

      if (launched) {
        launchY -= 6
        if (launchY < -60) { launched = false }
      }
      if (feedback > 0) feedback--
    }

    function draw() {
      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#020817'); bg.addColorStop(1, '#0f2040')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137 + 17) % W)
        const sy = ((i * 97  + 31) % (H - 80))
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2); ctx.fill()
      }

      // Ground
      ctx.fillStyle = '#1a3a1a'; ctx.fillRect(0, H - 50, W, 50)
      ctx.fillStyle = '#16a34a'; ctx.fillRect(0, H - 54, W, 6)

      if (curPhase === 'waiting') {
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Nunito, system-ui'
        ctx.fillText('Rocket Launch 🚀', W / 2, H / 2 - 22)
        ctx.fillStyle = '#FFD700'; ctx.font = 'bold 17px Nunito, system-ui'
        ctx.fillText('Press SPACE to start!', W / 2, H / 2 + 12)
        ctx.fillStyle = '#64748b'; ctx.font = '14px Nunito, system-ui'
        ctx.fillText('Press SPACE when the bar is in the green zone', W / 2, H / 2 + 38)
        ctx.textAlign = 'left'
        return
      }

      // Power bar track
      ctx.fillStyle = 'rgba(255,255,255,0.08)'
      ctx.beginPath(); ctx.roundRect(BAR_X - 4, BAR_Y - 4, BAR_W + 8, BAR_H + 8, 8); ctx.fill()
      ctx.fillStyle = '#1e293b'
      ctx.beginPath(); ctx.roundRect(BAR_X, BAR_Y, BAR_W, BAR_H, 6); ctx.fill()

      // Green zone
      const zoneY = BAR_Y + (1 - ZONE_HI) * BAR_H
      const zoneH = (ZONE_HI - ZONE_LO) * BAR_H
      ctx.fillStyle = 'rgba(34,197,94,0.28)'
      ctx.beginPath(); ctx.roundRect(BAR_X, zoneY, BAR_W, zoneH, 4); ctx.fill()
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(BAR_X, zoneY, BAR_W, zoneH, 4); ctx.stroke()

      // Bar fill
      const fillH   = BAR_H * barFrac
      const fillY   = BAR_Y + BAR_H - fillH
      const inGreen = inZone(barFrac)
      ctx.fillStyle = inGreen ? '#22c55e' : '#3b82f6'
      ctx.beginPath(); ctx.roundRect(BAR_X + 2, fillY, BAR_W - 4, fillH, 4); ctx.fill()

      // Indicator dot
      ctx.fillStyle = '#fff'
      ctx.shadowColor = inGreen ? '#22c55e' : '#3b82f6'; ctx.shadowBlur = 14
      ctx.beginPath(); ctx.arc(BAR_X + BAR_W / 2, fillY, 8, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      // Launch pad
      ctx.fillStyle = '#374151'; ctx.fillRect(W / 2 - 28, H - 54, 56, 10)

      // Rocket (on pad or flying)
      const rocketX = W / 2
      const rocketY = launched ? launchY : H - 54
      ctx.font = '38px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText('🚀', rocketX, rocketY)

      // Feedback
      if (feedback > 0) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = feedbackMsg.includes('green') ? '#ef4444' : '#22c55e'
        ctx.font = 'bold 20px Nunito, system-ui'
        ctx.fillText(feedbackMsg, W / 2, H - 66)
        if (launchScore === 3 && launched) {
          ctx.fillStyle = '#FFD700'; ctx.font = 'bold 26px Nunito, system-ui'
          ctx.fillText('+3', rocketX + 30, rocketY - 10)
        } else if (launchScore > 0) {
          ctx.fillStyle = '#86efac'; ctx.font = 'bold 20px Nunito, system-ui'
          ctx.fillText(`+${launchScore}`, rocketX + 28, rocketY - 8)
        }
      }

      // Score HUD
      ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.font = 'bold 16px Nunito, system-ui'
      ctx.fillText(`${curScore} pts`, W - 14, 28)
      ctx.textAlign = 'left'

      // Zone label
      ctx.fillStyle = '#22c55e'; ctx.font = 'bold 12px Nunito, system-ui'
      ctx.fillText('LAUNCH\nZONE', BAR_X + BAR_W + 10, zoneY + zoneH / 2 + 5)
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
          <h1 className="text-lg font-black text-white leading-none">🚀 Rocket Launch</h1>
          <p className="text-slate-400 text-xs mt-0.5">Press space when the bar is in the green zone</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-2xl font-black text-[#a855f7]">{score} pts</span>
          {isChildMode && <span className="text-slate-500 text-xs">Esc to exit</span>}
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-2 overflow-hidden">
        <canvas ref={canvasRef} width={W} height={H}
          className="rounded-2xl shadow-2xl"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          aria-label="Rocket Launch game canvas" />
      </main>
    </div>
  )
}
