/**
 * Melody Maker — /dashboard/child/:childId/music/melody-maker
 *
 * Eight coloured note bars spanning one octave of C major (C4–C5).
 * Each bar is synthesised via a triangle-wave oscillator with a short
 * ADSR envelope — no external sound files needed.
 *
 * Child mode: ScanGroup cycles bars, spacebar plays the highlighted note.
 * Caregiver / mouse mode: click any bar directly.
 *
 * Each note triggers a 400 ms visual flash + gentle ripple on the bar.
 */
import { useRef, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

// ---------------------------------------------------------------------------
// Notes (C major, one octave)
// ---------------------------------------------------------------------------

const NOTES = [
  { id: 'C4', label: 'C',  freq: 261.63, color: '#ef4444', height: 200 },
  { id: 'D4', label: 'D',  freq: 293.66, color: '#f97316', height: 185 },
  { id: 'E4', label: 'E',  freq: 329.63, color: '#FFD700', height: 170 },
  { id: 'F4', label: 'F',  freq: 349.23, color: '#22c55e', height: 155 },
  { id: 'G4', label: 'G',  freq: 392.00, color: '#14b8a6', height: 140 },
  { id: 'A4', label: 'A',  freq: 440.00, color: '#3b82f6', height: 125 },
  { id: 'B4', label: 'B',  freq: 493.88, color: '#a855f7', height: 110 },
  { id: 'C5', label: "C'", freq: 523.25, color: '#ec4899', height: 100 },
]

const FLASH_MS = 400

// ---------------------------------------------------------------------------
// Web Audio synthesiser — triangle wave with ADSR
// ---------------------------------------------------------------------------

function getCtx(ref) {
  if (!ref.current) ref.current = new AudioContext()
  if (ref.current.state === 'suspended') ref.current.resume()
  return ref.current
}

function playNote(ctx, freq) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type   = 'triangle'
  osc.frequency.value = freq

  const now = ctx.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.45, now + 0.02)   // attack
  gain.gain.setValueAtTime(0.45, now + 0.04)            // sustain
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85) // decay+release

  osc.connect(gain); gain.connect(ctx.destination)
  osc.start(now); osc.stop(now + 0.85)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MelodyMaker() {
  const { childId }     = useParams()
  const { isChildMode, scanProfile } = useScan()
  const audioCtxRef     = useRef(null)
  const [flashId, setFlashId] = useState(null)

  const play = useCallback((note) => {
    const ctx = getCtx(audioCtxRef)
    playNote(ctx, note.freq)
    setFlashId(note.id)
    setTimeout(() => setFlashId(null), FLASH_MS)
  }, [])

  const bars = (
    <div className="flex items-end gap-3 sm:gap-4" style={{ height: 260 }}>
      {NOTES.map((note) =>
        isChildMode ? (
          <ScanItem
            key={note.id}
            onSelect={() => play(note)}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-t-xl"
          >
            <NoteBar note={note} flashing={flashId === note.id} />
          </ScanItem>
        ) : (
          <button
            key={note.id}
            onClick={() => play(note)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]
                       rounded-t-xl"
            aria-label={`Play note ${note.label}`}
          >
            <NoteBar note={note} flashing={flashId === note.id} />
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
          <h1 className="text-lg font-black text-white leading-none">🎵 Melody Maker</h1>
          <p className="text-slate-400 text-xs mt-0.5">
            {isChildMode ? 'Scan to a note, then press space to play it' : 'Click a note to play'}
          </p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-6">
        {isChildMode ? (
          <ScanGroup
            active
            scanSpeedMs={scanProfile.scanSpeedMs}
            highlightColor={scanProfile.scanHighlightColor}
          >
            {bars}
          </ScanGroup>
        ) : (
          bars
        )}

        {/* Note name legend */}
        <div className="flex gap-3 sm:gap-4">
          {NOTES.map((note) => (
            <div key={note.id} className="text-center" style={{ width: 48 }}>
              <span
                className="text-xs font-black"
                style={{ color: flashId === note.id ? note.color : '#64748b' }}
              >
                {note.label}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Note bar
// ---------------------------------------------------------------------------

function NoteBar({ note, flashing }) {
  return (
    <div
      className="flex flex-col items-center justify-end rounded-t-xl transition-all duration-75 select-none"
      style={{
        width:           48,
        height:          note.height,
        backgroundColor: flashing ? note.color : note.color + '55',
        borderTop:       `3px solid ${note.color}`,
        borderLeft:      `2px solid ${note.color}88`,
        borderRight:     `2px solid ${note.color}88`,
        transform:       flashing ? 'scaleY(1.04) scaleX(0.97)' : 'scaleY(1)',
        transformOrigin: 'bottom',
        boxShadow:       flashing ? `0 -8px 20px ${note.color}88` : 'none',
      }}
      aria-label={`Note ${note.label}`}
    />
  )
}
