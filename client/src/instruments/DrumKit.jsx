/**
 * Drum Kit — /dashboard/child/:childId/music/drum-kit
 *
 * Six drum pads (Kick, Snare, Hi-Hat, Tom, Crash, Clap), each synthesised
 * entirely with the Web Audio API — no external sound files.
 *
 * Child mode: ScanGroup cycles pads, spacebar triggers the highlighted pad.
 * Caregiver / mouse mode: click any pad directly.
 *
 * Each hit causes a 200 ms visual flash on the pad.
 */
import { useRef, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

// ---------------------------------------------------------------------------
// Web Audio drum synthesisers
// ---------------------------------------------------------------------------

/** Ensure AudioContext exists and is running */
function getCtx(ref) {
  if (!ref.current) ref.current = new AudioContext()
  if (ref.current.state === 'suspended') ref.current.resume()
  return ref.current
}

function playKick(ctx) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(ctx.destination)
  osc.frequency.setValueAtTime(55, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
  gain.gain.setValueAtTime(1.0, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.45)
}

function makeNoiseBuf(ctx, durationSec) {
  const len = Math.floor(ctx.sampleRate * durationSec)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d   = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

function playSnare(ctx) {
  // Noise layer
  const src   = ctx.createBufferSource()
  src.buffer  = makeNoiseBuf(ctx, 0.18)
  const bf    = ctx.createBiquadFilter()
  bf.type     = 'bandpass'; bf.frequency.value = 1800; bf.Q.value = 0.6
  const ng    = ctx.createGain()
  ng.gain.setValueAtTime(0.75, ctx.currentTime)
  ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
  src.connect(bf); bf.connect(ng); ng.connect(ctx.destination)
  src.start()

  // Tone layer
  const osc   = ctx.createOscillator()
  const tg    = ctx.createGain()
  osc.frequency.value = 200
  tg.gain.setValueAtTime(0.55, ctx.currentTime)
  tg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
  osc.connect(tg); tg.connect(ctx.destination)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06)
}

function playHiHat(ctx) {
  const src   = ctx.createBufferSource()
  src.buffer  = makeNoiseBuf(ctx, 0.06)
  const bf    = ctx.createBiquadFilter()
  bf.type     = 'highpass'; bf.frequency.value = 8000
  const gain  = ctx.createGain()
  gain.gain.setValueAtTime(0.55, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
  src.connect(bf); bf.connect(gain); gain.connect(ctx.destination)
  src.start()
}

function playTom(ctx) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.setValueAtTime(100, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.38)
  gain.gain.setValueAtTime(0.85, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38)
  osc.connect(gain); gain.connect(ctx.destination)
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.38)
}

function playCrash(ctx) {
  const src   = ctx.createBufferSource()
  src.buffer  = makeNoiseBuf(ctx, 0.9)
  const bf    = ctx.createBiquadFilter()
  bf.type     = 'bandpass'; bf.frequency.value = 5000; bf.Q.value = 0.4
  const gain  = ctx.createGain()
  gain.gain.setValueAtTime(0.4, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
  src.connect(bf); bf.connect(gain); gain.connect(ctx.destination)
  src.start()
}

function playClap(ctx) {
  // Three closely-spaced noise pops
  for (let i = 0; i < 3; i++) {
    const t   = ctx.currentTime + i * 0.012
    const src = ctx.createBufferSource()
    src.buffer = makeNoiseBuf(ctx, 0.05)
    const bf   = ctx.createBiquadFilter()
    bf.type    = 'bandpass'; bf.frequency.value = 1400; bf.Q.value = 0.8
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.5, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
    src.connect(bf); bf.connect(gain); gain.connect(ctx.destination)
    src.start(t)
  }
}

// ---------------------------------------------------------------------------
// Pad definitions
// ---------------------------------------------------------------------------

const PADS = [
  { id: 'kick',   label: 'Kick',    emoji: '💥', color: '#ef4444', play: playKick  },
  { id: 'snare',  label: 'Snare',   emoji: '🪘', color: '#f97316', play: playSnare },
  { id: 'hihat',  label: 'Hi-Hat',  emoji: '🔔', color: '#FFD700', play: playHiHat },
  { id: 'tom',    label: 'Tom',     emoji: '🎵', color: '#22c55e', play: playTom   },
  { id: 'crash',  label: 'Crash',   emoji: '✨', color: '#3b82f6', play: playCrash },
  { id: 'clap',   label: 'Clap',    emoji: '👏', color: '#a855f7', play: playClap  },
]

const FLASH_MS = 200

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DrumKit() {
  const { childId }     = useParams()
  const { isChildMode, scanProfile } = useScan()
  const audioCtxRef     = useRef(null)
  const [flashId, setFlashId] = useState(null)

  const hit = useCallback((pad) => {
    const ctx = getCtx(audioCtxRef)
    pad.play(ctx)
    setFlashId(pad.id)
    setTimeout(() => setFlashId(null), FLASH_MS)
  }, [])

  const padGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 w-full max-w-xl">
      {PADS.map((pad) =>
        isChildMode ? (
          <ScanItem
            key={pad.id}
            onSelect={() => hit(pad)}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-2xl"
          >
            <PadFace pad={pad} flashing={flashId === pad.id} />
          </ScanItem>
        ) : (
          <button
            key={pad.id}
            onClick={() => hit(pad)}
            className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
            aria-label={`${pad.label} drum pad`}
          >
            <PadFace pad={pad} flashing={flashId === pad.id} />
          </button>
        )
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/music`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Music
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">🥁 Drum Kit</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {isChildMode ? 'Scan to a pad, then press space to hit it' : 'Click a pad to play'}
          </p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {isChildMode ? (
          <ScanGroup
            active
            scanSpeedMs={scanProfile.scanSpeedMs}
            highlightColor={scanProfile.scanHighlightColor}
          >
            {padGrid}
          </ScanGroup>
        ) : (
          padGrid
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pad face
// ---------------------------------------------------------------------------

function PadFace({ pad, flashing }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 rounded-2xl
                 border-2 transition-all duration-75 select-none w-full"
      style={{
        minHeight: 130,
        backgroundColor: flashing ? pad.color : pad.color + '28',
        borderColor:     flashing ? pad.color : pad.color + '55',
        transform:       flashing ? 'scale(0.96)' : 'scale(1)',
        boxShadow:       flashing ? `0 0 24px ${pad.color}88` : 'none',
      }}
    >
      <span className="text-5xl leading-none" aria-hidden>{pad.emoji}</span>
      <span
        className="text-sm font-black tracking-wide"
        style={{ color: flashing ? '#fff' : pad.color }}
      >
        {pad.label}
      </span>
    </div>
  )
}
