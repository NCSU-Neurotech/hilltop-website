/**
 * Generic instrument page for child-friendly music play.
 * Melodic instruments use Tone.js Sampler (real recorded samples).
 * Percussion uses Web Audio API synthesis.
 */
import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'
import {
  playCowbellSound,
  playMaracasSound,
  playTambourineSound,
  playBellTowerNote,
  playGongHit,
  playDrumKick,
  playDrumSnare,
  playDrumHiHat,
  playDrumTom,
  playDrumCrash,
  playDrumClap,
} from '../utils/audio'
import { playNote, preloadSampler } from '../utils/toneInstruments'

const INSTRUMENTS = [
  // ── Percussion (Web Audio synthesis) ─────────────────────────────────────
  {
    id: 'drum-kit',
    name: 'Drum Kit',
    emoji: '🥁',
    desc: 'Tap any drum pad',
    color: '#ef4444',
    layout: 'drum',
    items: [
      { id: 'kick',  label: 'Kick',   emoji: '💥', color: '#ef4444', play: playDrumKick  },
      { id: 'snare', label: 'Snare',  emoji: '🪘', color: '#f97316', play: playDrumSnare },
      { id: 'hihat', label: 'Hi-Hat', emoji: '🔔', color: '#fde047', play: playDrumHiHat },
      { id: 'tom',   label: 'Tom',    emoji: '🥁', color: '#22c55e', play: playDrumTom   },
      { id: 'crash', label: 'Crash',  emoji: '✨', color: '#3b82f6', play: playDrumCrash },
      { id: 'clap',  label: 'Clap',   emoji: '👏', color: '#a855f7', play: playDrumClap  },
    ],
  },
  {
    id: 'percussion-mix',
    name: 'Percussion Wall',
    emoji: '🪘',
    desc: 'Strike cowbell, tambourine, maracas, and gong in one place',
    color: '#fb923c',
    layout: 'percussion',
    items: [
      { id: 'cowbell',    label: 'Cowbell',    emoji: '🔔',  color: '#f97316', desc: 'Hit the cowbell',       play: playCowbellSound    },
      { id: 'tambourine', label: 'Tambourine', emoji: '🪘',  color: '#22c55e', desc: 'Shake the tambourine',  play: playTambourineSound },
      { id: 'maracas',    label: 'Maracas',    emoji: '🎶',  color: '#f59e0b', desc: 'Shake the maracas',     play: playMaracasSound    },
      { id: 'gong',       label: 'Gong',       emoji: '🛎️', color: '#0ea5e9', desc: 'Strike the gong',       play: playGongHit         },
    ],
  },
  {
    id: 'xylophone',
    name: 'Xylophone',
    emoji: '🪘',
    desc: 'Strike the wooden bars',
    color: '#f97316',
    layout: 'xylophone',
    samplerName: 'xylophone',
    items: [
      { id: 'C4',  label: 'C',   color: '#ef4444', height: 280, play: () => playNote('xylophone', 'C4',  0.8) },
      { id: 'D4',  label: 'D',   color: '#f97316', height: 250, play: () => playNote('xylophone', 'D4',  0.8) },
      { id: 'E4',  label: 'E',   color: '#fde047', height: 220, play: () => playNote('xylophone', 'E4',  0.8) },
      { id: 'F4',  label: 'F',   color: '#22c55e', height: 200, play: () => playNote('xylophone', 'F4',  0.8) },
      { id: 'G4',  label: 'G',   color: '#3b82f6', height: 180, play: () => playNote('xylophone', 'G4',  0.8) },
      { id: 'A4',  label: 'A',   color: '#a855f7', height: 160, play: () => playNote('xylophone', 'A4',  0.8) },
      { id: 'B4',  label: 'B',   color: '#ec4899', height: 140, play: () => playNote('xylophone', 'B4',  0.8) },
      { id: 'C5',  label: "C'",  color: '#0ea5e9', height: 120, play: () => playNote('xylophone', 'C5',  0.8) },
    ],
  },

  // ── Keyboard & Bell ───────────────────────────────────────────────────────
  {
    id: 'piano-keys',
    name: 'Piano Keys',
    emoji: '🎹',
    desc: 'Press the keys to hear music',
    color: '#22c55e',
    layout: 'piano',
    samplerName: 'piano',
    items: [
      { id: 'C4',  label: 'C',  isBlack: false },
      { id: 'C#4', label: 'C♯', isBlack: true  },
      { id: 'D4',  label: 'D',  isBlack: false },
      { id: 'D#4', label: 'D♯', isBlack: true  },
      { id: 'E4',  label: 'E',  isBlack: false },
      { id: 'F4',  label: 'F',  isBlack: false },
      { id: 'F#4', label: 'F♯', isBlack: true  },
      { id: 'G4',  label: 'G',  isBlack: false },
      { id: 'G#4', label: 'G♯', isBlack: true  },
      { id: 'A4',  label: 'A',  isBlack: false },
      { id: 'A#4', label: 'A♯', isBlack: true  },
      { id: 'B4',  label: 'B',  isBlack: false },
      { id: 'C5',  label: "C'", isBlack: false },
    ].map((note) => ({ ...note, play: () => playNote('piano', note.id, 2.0), color: note.isBlack ? '#111' : '#fff' })),
  },
  {
    id: 'melody-maker',
    name: 'Melody Maker',
    emoji: '🎵',
    desc: 'Tap colourful harp notes to build a melody',
    color: '#a855f7',
    layout: 'melody',
    samplerName: 'harp',
    items: [
      { id: 'C4', label: 'C',   color: '#ef4444', height: 280, play: () => playNote('harp', 'C4', 2.5) },
      { id: 'D4', label: 'D',   color: '#f97316', height: 250, play: () => playNote('harp', 'D4', 2.5) },
      { id: 'E4', label: 'E',   color: '#fde047', height: 220, play: () => playNote('harp', 'E4', 2.5) },
      { id: 'F4', label: 'F',   color: '#22c55e', height: 200, play: () => playNote('harp', 'F4', 2.5) },
      { id: 'G4', label: 'G',   color: '#14b8a6', height: 180, play: () => playNote('harp', 'G4', 2.5) },
      { id: 'A4', label: 'A',   color: '#3b82f6', height: 160, play: () => playNote('harp', 'A4', 2.5) },
      { id: 'B4', label: 'B',   color: '#a855f7', height: 140, play: () => playNote('harp', 'B4', 2.5) },
      { id: 'C5', label: "C'",  color: '#ec4899', height: 120, play: () => playNote('harp', 'C5', 2.5) },
    ],
  },
  {
    id: 'bell-tower',
    name: 'Bell Tower',
    emoji: '🔔',
    desc: 'Ring bright bells from a tall tower',
    color: '#fde047',
    layout: 'bell-tower',
    items: [
      { id: 'G4', label: 'G',   color: '#fdba74', height: 300, play: () => playBellTowerNote(392.0)  },
      { id: 'A4', label: 'A',   color: '#f97316', height: 270, play: () => playBellTowerNote(440.0)  },
      { id: 'B4', label: 'B',   color: '#f59e0b', height: 240, play: () => playBellTowerNote(493.88) },
      { id: 'C5', label: "C'",  color: '#fde047', height: 210, play: () => playBellTowerNote(523.25) },
    ],
  },

  // ── Wind (Tone.js Sampler) ────────────────────────────────────────────────
  {
    id: 'flute',
    name: 'Flute',
    emoji: '🪈',
    desc: 'Play soft breathy flute notes',
    color: '#38bdf8',
    layout: 'wind',
    samplerName: 'flute',
    items: [
      { id: 'G4', label: 'G',   color: '#7dd3fc', height: 250, play: () => playNote('flute', 'G4', 1.5) },
      { id: 'A4', label: 'A',   color: '#38bdf8', height: 220, play: () => playNote('flute', 'A4', 1.5) },
      { id: 'B4', label: 'B',   color: '#0ea5e9', height: 190, play: () => playNote('flute', 'B4', 1.5) },
      { id: 'C5', label: "C'",  color: '#0284c7', height: 170, play: () => playNote('flute', 'C5', 1.5) },
    ],
  },
  {
    id: 'pan-flute',
    name: 'Pan Flute',
    emoji: '🪈',
    desc: 'Warm clarinet-like pipes of different lengths',
    color: '#60a5fa',
    layout: 'wind',
    samplerName: 'clarinet',
    items: [
      { id: 'F4', label: 'F',  color: '#93c5fd', height: 250, play: () => playNote('clarinet', 'F4', 1.5) },
      { id: 'G4', label: 'G',  color: '#60a5fa', height: 230, play: () => playNote('clarinet', 'G4', 1.5) },
      { id: 'A4', label: 'A',  color: '#3b82f6', height: 210, play: () => playNote('clarinet', 'A4', 1.5) },
      { id: 'B4', label: 'B',  color: '#2563eb', height: 190, play: () => playNote('clarinet', 'B4', 1.5) },
    ],
  },

  // ── Strings (Tone.js Sampler) ─────────────────────────────────────────────
  {
    id: 'violin',
    name: 'Violin',
    emoji: '🎻',
    desc: 'Bow bright warm string tones',
    color: '#ec4899',
    layout: 'strings',
    samplerName: 'violin',
    items: [
      { id: 'G3', label: 'G',  color: '#fb7185', height: 250, play: () => playNote('violin', 'G3', 2.0) },
      { id: 'A3', label: 'A',  color: '#f472b6', height: 220, play: () => playNote('violin', 'A3', 2.0) },
      { id: 'B3', label: 'B',  color: '#ec4899', height: 190, play: () => playNote('violin', 'B3', 2.0) },
      { id: 'C4', label: 'C',  color: '#db2777', height: 170, play: () => playNote('violin', 'C4', 2.0) },
    ],
  },
  {
    id: 'cello',
    name: 'Cello',
    emoji: '🎻',
    desc: 'Draw deep bowed cello tones',
    color: '#f472b6',
    layout: 'strings',
    samplerName: 'cello',
    items: [
      { id: 'C3', label: 'C',  color: '#fca5a5', height: 280, play: () => playNote('cello', 'C3', 2.0) },
      { id: 'D3', label: 'D',  color: '#fb7185', height: 250, play: () => playNote('cello', 'D3', 2.0) },
      { id: 'E3', label: 'E',  color: '#f472b6', height: 220, play: () => playNote('cello', 'E3', 2.0) },
      { id: 'G3', label: 'G',  color: '#ec4899', height: 190, play: () => playNote('cello', 'G3', 2.0) },
    ],
  },
]

export default function InstrumentPlayground() {
  const { childId, instrumentId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const [flashId, setFlashId] = useState(null)
  const instrument = INSTRUMENTS.find((inst) => inst.id === instrumentId)

  // Kick off sample loading as soon as the instrument page opens
  useEffect(() => {
    if (instrument?.samplerName) preloadSampler(instrument.samplerName)
  }, [instrument?.samplerName])

  const hit = useCallback((item) => {
    if (typeof item.play === 'function') item.play()
    setFlashId(item.id)
    setTimeout(() => setFlashId(null), 180)
  }, [])

  if (!instrument) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <div className="rounded-3xl bg-[#1e293b] border border-slate-700/60 p-10 text-center max-w-md">
          <h1 className="text-2xl font-black text-white mb-4">Instrument not found</h1>
          <p className="text-slate-400 mb-6">Choose a different music instrument from the hub.</p>
          <Link
            to={`/dashboard/child/${childId}/music`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#2563eb] text-white font-semibold"
          >
            Back to Music
          </Link>
        </div>
      </div>
    )
  }

  const body = instrument.id === 'piano-keys' ? (
    <PianoKeyboard keys={instrument.items} flashId={flashId} onHit={hit} isChildMode={isChildMode} />
  ) : instrument.id === 'melody-maker' ? (
    <MelodyMakerStrip items={instrument.items} flashId={flashId} onHit={hit} isChildMode={isChildMode} />
  ) : instrument.id === 'bell-tower' ? (
    <BellTowerDisplay items={instrument.items} flashId={flashId} onHit={hit} isChildMode={isChildMode} />
  ) : instrument.id === 'percussion-mix' ? (
    <PercussionGrid items={instrument.items} flashId={flashId} onHit={hit} isChildMode={isChildMode} />
  ) : instrument.id === 'drum-kit' ? (
    <DrumPadGrid items={instrument.items} flashId={flashId} onHit={hit} isChildMode={isChildMode} />
  ) : (
    <BarStage layout={instrument.layout} items={instrument.items} flashId={flashId} onHit={hit} isChildMode={isChildMode} />
  )

  const backgroundGradient = instrument.id === 'drum-kit'
    ? 'bg-gradient-to-br from-red-950 via-slate-900 to-orange-900'
    : instrument.id === 'piano-keys'
    ? 'bg-gradient-to-br from-slate-950 via-gray-900 to-slate-800'
    : instrument.id === 'melody-maker'
    ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-900'
    : instrument.id === 'xylophone'
    ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-orange-900'
    : instrument.id === 'bell-tower'
    ? 'bg-gradient-to-br from-yellow-950 via-amber-900 to-yellow-800'
    : instrument.id === 'percussion-mix'
    ? 'bg-gradient-to-br from-orange-950 via-amber-900 to-red-900'
    : instrument.id === 'flute'
    ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900'
    : instrument.id === 'pan-flute'
    ? 'bg-gradient-to-br from-blue-950 via-cyan-900 to-slate-900'
    : instrument.id === 'violin'
    ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-purple-900'
    : instrument.id === 'cello'
    ? 'bg-gradient-to-br from-pink-950 via-purple-900 to-slate-900'
    : 'bg-[#0f172a]'

  return (
    <div className={`min-h-screen flex flex-col ${backgroundGradient}`}>
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/music`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Music
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-none">{instrument.emoji} {instrument.name}</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            {instrument.desc}
          </p>
        </div>
        {isChildMode ? (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        ) : (
          <span className="text-slate-500 text-xs">Tap the big cards or buttons to play</span>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-6 sm:p-10 gap-8">
        {isChildMode ? (
          <ScanGroup
            active
            scanSpeedMs={scanProfile.scanSpeedMs}
            highlightColor={scanProfile.scanHighlightColor}
            selectionTone={false}
          >
            {body}
          </ScanGroup>
        ) : (
          body
        )}

        {instrument.layout === 'single' && (
          <div className="text-slate-400 text-sm text-center max-w-md">
            <p>{instrument.desc}</p>
          </div>
        )}
      </main>
    </div>
  )
}

function NoteBar({ note, flashing }) {
  return (
    <div
      className="flex flex-col items-center justify-end rounded-t-xl transition-all duration-75 select-none"
      style={{
        width: 92,
        height: note.height,
        backgroundColor: flashing ? note.color : note.color + '55',
        borderTop: `4px solid ${note.color}`,
        borderLeft: `2px solid ${note.color}88`,
        borderRight: `2px solid ${note.color}88`,
        transform: flashing ? 'scaleY(1.05) scaleX(0.98)' : 'scaleY(1)',
        transformOrigin: 'bottom',
        boxShadow: flashing ? `0 -10px 24px ${note.color}88` : 'none',
      }}
      aria-label={`Note ${note.label}`}
    >
      <span
        className="text-xs font-black pb-2 select-none"
        style={{ color: flashing ? '#fff' : '#ffffffbb' }}
      >
        {note.label}
      </span>
    </div>
  )
}

function BarStage({ layout, items, flashId, onHit, isChildMode }) {
  const theme = layout === 'wind'
    ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border border-cyan-400/30 shadow-lg shadow-cyan-500/20'
    : layout === 'strings'
    ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-purple-900 border border-rose-400/30 shadow-lg shadow-rose-500/20'
    : layout === 'xylophone'
    ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-orange-900 border border-amber-500/30 shadow-lg shadow-amber-500/20'
    : layout === 'bars'
    ? 'bg-gradient-to-br from-purple-950 via-slate-900 to-pink-900 border border-purple-400/30 shadow-lg shadow-purple-500/20'
    : layout === 'piano'
    ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 border border-gray-400/30 shadow-lg shadow-gray-500/20'
    : layout === 'percussion'
    ? 'bg-gradient-to-br from-orange-950 via-amber-900 to-red-900 border border-orange-400/30 shadow-lg shadow-orange-500/20'
    : layout === 'bell-tower'
    ? 'bg-gradient-to-br from-yellow-950 via-amber-900 to-yellow-800 border border-yellow-400/30 shadow-lg shadow-yellow-500/20'
    : 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border border-slate-700/50 shadow-lg shadow-slate-500/10'

  return (
    <div className={`w-full max-w-7xl rounded-3xl p-4 ${theme}`}>
      <div className="flex items-end justify-center gap-4 sm:gap-5 overflow-x-auto pb-2" style={{ height: 400 }}>
        {items.map((item) => (
          isChildMode ? (
            <ScanItem
              key={item.id}
              onSelect={() => onHit(item)}
              as="div"
              style={{ minWidth: 0, minHeight: 0 }}
              className="rounded-t-3xl"
            >
              <NoteBar note={item} flashing={flashId === item.id} />
            </ScanItem>
          ) : (
            <button
              key={item.id}
              onClick={() => onHit(item)}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] rounded-t-3xl"
              aria-label={`Play note ${item.label}`}
            >
              <NoteBar note={item} flashing={flashId === item.id} />
            </button>
          )
        ))}
      </div>
    </div>
  )
}

function MelodyMakerStrip({ items, flashId, onHit, isChildMode }) {
  return (
    <div className="w-full max-w-7xl">
      <div className="bg-gradient-to-br from-purple-900/40 via-slate-800/40 to-pink-900/40 border-2 border-purple-400/40 rounded-3xl p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => {
            const active = flashId === item.id
            const card = (
              <div
                className="h-full rounded-[2rem] border-2 p-6 flex flex-col justify-between gap-4 text-center transition-all duration-150"
                style={{
                  backgroundColor: active ? item.color : item.color + '28',
                  borderColor: active ? item.color : item.color + '55',
                  boxShadow: active ? `0 0 32px ${item.color}88` : 'none',
                }}
              >
                <div
                  className="flex items-center justify-center w-20 h-20 rounded-full border-2 mx-auto"
                  style={{
                    backgroundColor: active ? '#ffffff22' : item.color + '33',
                    borderColor: active ? '#fff' : item.color,
                  }}
                  aria-hidden
                >
                  <span className="text-3xl font-black select-none" style={{ color: active ? '#fff' : item.color }}>
                    {item.label}
                  </span>
                </div>
                <p className="text-sm text-slate-300 text-center mt-1">Tap to play</p>
              </div>
            )

            return isChildMode ? (
              <ScanItem
                key={item.id}
                onSelect={() => onHit(item)}
                as="div"
                style={{ minWidth: 0, minHeight: 0 }}
                className="rounded-[2rem]"
              >
                {card}
              </ScanItem>
            ) : (
              <button
                key={item.id}
                onClick={() => onHit(item)}
                className="rounded-[2rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] w-full h-full"
                aria-label={`Play melody note ${item.label}`}
              >
                {card}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BellTowerDisplay({ items, flashId, onHit, isChildMode }) {
  return (
    <div className="w-full max-w-6xl">
      <div className="bg-gradient-to-br from-yellow-900/40 via-amber-800/40 to-yellow-800/40 border-2 border-yellow-400/40 rounded-3xl p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => {
            const active = flashId === item.id
            const tile = (
              <div
                className="rounded-[2.5rem] p-8 flex flex-col items-center justify-between gap-4 text-center transition-all duration-150"
                style={{
                  backgroundColor: active ? item.color : item.color + '22',
                  border: `2px solid ${active ? item.color : item.color + '55'}`,
                  boxShadow: active ? `0 0 28px ${item.color}88` : 'none',
                }}
              >
                <span className="text-8xl">🔔</span>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-white">{item.label}</p>
                  <p className="text-sm text-slate-300 mt-1">Bell tone</p>
                </div>
              </div>
            )

            return isChildMode ? (
              <ScanItem
                key={item.id}
                onSelect={() => onHit(item)}
                as="div"
                style={{ minWidth: 0, minHeight: 0 }}
                className="rounded-[2.5rem]"
              >
                {tile}
              </ScanItem>
            ) : (
              <button
                key={item.id}
                onClick={() => onHit(item)}
                className="rounded-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] w-full h-full"
                aria-label={`Ring bell ${item.label}`}
              >
                {tile}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PercussionGrid({ items, flashId, onHit, isChildMode }) {
  return (
    <div className="w-full max-w-6xl">
      <div className="bg-gradient-to-br from-orange-900/40 via-amber-800/40 to-red-900/40 border-2 border-orange-400/40 rounded-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => {
            const active = flashId === item.id
            const card = (
              <div
                className="rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 text-center transition-all duration-150 min-h-[220px]"
                style={{
                  backgroundColor: active ? item.color : item.color + '22',
                  border: `2px solid ${active ? item.color : item.color + '55'}`,
                  boxShadow: active ? `0 0 28px ${item.color}88` : 'none',
                }}
              >
                <span className="text-8xl">{item.emoji}</span>
                <div>
                  <p className="text-2xl font-black text-white">{item.label}</p>
                  <p className="text-sm text-slate-300 mt-1">{item.desc}</p>
                </div>
              </div>
            )

            return isChildMode ? (
              <ScanItem
                key={item.id}
                onSelect={() => onHit(item)}
                as="div"
                style={{ minWidth: 0, minHeight: 0 }}
                className="rounded-[2.5rem]"
              >
                {card}
              </ScanItem>
            ) : (
              <button
                key={item.id}
                onClick={() => onHit(item)}
                className="rounded-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] w-full h-full"
                aria-label={`Activate percussion ${item.label}`}
              >
                {card}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PianoKeyboard({ keys, flashId, onHit, isChildMode }) {
  const whiteKeys = keys.filter((key) => !key.isBlack)
  const blackKeys = keys.filter((key) => key.isBlack)
  const blackPositions = {
    'C#4': '14%',
    'D#4': '28%',
    'F#4': '56%',
    'G#4': '70%',
    'A#4': '84%',
  }

  const renderKey = (key, isBlack) => {
    const button = (
      <button
        type="button"
        onClick={() => onHit(key)}
        className={`relative w-full h-full rounded-b-3xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] ${isBlack ? 'bg-slate-950 text-white border-slate-700' : 'bg-white text-slate-950 border-slate-300'}`}
        style={{ paddingBottom: 24 }}
        aria-label={`Play piano key ${key.label}`}
      >
        <div className="absolute left-3 top-3 text-xs font-black uppercase tracking-[0.2em]" style={{ color: isBlack ? '#fff' : '#111' }}>
          {key.label}
        </div>
        {flashId === key.id && (
          <span className="absolute inset-0 rounded-b-3xl bg-white/15" />
        )}
      </button>
    )

    return isChildMode ? (
      <ScanItem key={key.id} onSelect={() => onHit(key)} as="div" style={{ width: '100%', height: '100%' }}>
        {button}
      </ScanItem>
    ) : (
      <div key={key.id} style={{ width: '100%', height: '100%' }}>
        {button}
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl">
      <div className="relative mx-auto h-[400px] max-w-full select-none rounded-3xl border-2 border-gray-400/50 bg-gradient-to-b from-gray-800 via-gray-900 to-slate-950 p-4 shadow-2xl shadow-black/60">
        <div className="flex h-full items-end gap-1">
          {whiteKeys.map((key) => (
            <div key={key.id} className="flex-1 min-w-0 h-full">
              {renderKey(key, false)}
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 h-[62%] pointer-events-none">
          {blackKeys.map((key) => (
            <div
              key={key.id}
              className="absolute top-0 h-full"
              style={{ left: blackPositions[key.id], width: '8%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}
            >
              {renderKey(key, true)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DrumPadGrid({ items, flashId, onHit, isChildMode }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => {
          const active = flashId === item.id
          const pad = (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-75 select-none"
              style={{
                minHeight: 130,
                backgroundColor: active ? item.color : item.color + '28',
                borderColor:     active ? item.color : item.color + '55',
                transform:       active ? 'scale(0.96)' : 'scale(1)',
                boxShadow:       active ? `0 0 24px ${item.color}88` : 'none',
              }}
            >
              <span className="text-5xl leading-none" aria-hidden>{item.emoji}</span>
              <span
                className="text-sm font-black tracking-wide"
                style={{ color: active ? '#fff' : item.color }}
              >
                {item.label}
              </span>
            </div>
          )
          return isChildMode ? (
            <ScanItem
              key={item.id}
              onSelect={() => onHit(item)}
              as="div"
              style={{ minWidth: 0, minHeight: 0 }}
              className="rounded-2xl"
            >
              {pad}
            </ScanItem>
          ) : (
            <button
              key={item.id}
              onClick={() => onHit(item)}
              className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
              aria-label={`${item.label} drum pad`}
            >
              {pad}
            </button>
          )
        })}
      </div>
    </div>
  )
}
