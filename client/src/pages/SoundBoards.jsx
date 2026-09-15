/**
 * SoundBoards — /dashboard/child/:childId/sound-boards
 *
 * Flat, non-recursive structure: all sounds in one grid per board.
 * Supports 6 boards: Instruments, Animals, Goofy, Superheroes, Nature, Vehicles.
 * (Movies and Cartoons were both removed — each named real copyrighted
 * properties directly, movie franchises and cartoon characters respectively.)
 *
 * In Child Mode: ScanGroup auto-cycles through all sounds.
 * In Caregiver Mode: Board selector + sound grid.
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { useAuth } from '../context/AuthContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function SoundBoards() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { isChildMode, scanProfile } = useScan()
  const { isDemo } = useAuth()

  const [soundBoards, setSoundBoards] = useState([])
  const [activeBoardId, setActiveBoardId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch sound boards for facility
  useEffect(() => {
    setLoading(true)
    setError('')

    if (isDemo) {
      // Demo data — mirrors server/prisma/seed.js, which now matches this
      // list exactly. Movies and Cartoons were both removed entirely (not
      // just deferred) — each named real copyrighted properties directly:
      // movie franchises (Star Wars, Batman, Avengers...) and cartoon
      // characters (Mickey Mouse, SpongeBob...) respectively.
      const demoBoards = [
        {
          id: 'demo-instruments',
          name: 'Instruments',
          emoji: '🎵',
          color: '#a855f7',
          desc: 'Play musical instruments',
          sounds: [
            { id: 'piano', name: 'Piano', emoji: '🎹', uri: '/sounds/instruments/piano.mp3' },
            { id: 'drums', name: 'Drums', emoji: '🥁', uri: '/sounds/instruments/drums.mp3' },
            { id: 'guitar', name: 'Guitar', emoji: '🎸', uri: '/sounds/instruments/guitar.mp3' },
            { id: 'trumpet', name: 'Trumpet', emoji: '🎺', uri: '/sounds/instruments/trumpet.mp3' },
            { id: 'violin', name: 'Violin', emoji: '🎻', uri: '/sounds/instruments/violin.mp3' },
            { id: 'xylophone', name: 'Xylophone', emoji: '🎠', uri: '/sounds/instruments/xylophone.mp3' },
            { id: 'flute', name: 'Flute', emoji: '🪶', uri: '/sounds/instruments/flute.mp3' },
            { id: 'harmonica', name: 'Harmonica', emoji: '🎵', uri: '/sounds/instruments/harmonica.mp3' },
            { id: 'bells', name: 'Bells', emoji: '🔔', uri: '/sounds/instruments/bells.mp3' },
            { id: 'harp', name: 'Harp', emoji: '🎼', uri: '/sounds/instruments/harp.mp3' },
          ],
        },
        {
          id: 'demo-animals',
          name: 'Animals',
          emoji: '🦁',
          color: '#84cc16',
          desc: 'Real animal sounds',
          sounds: [
            { id: 'dog', name: 'Dog', emoji: '🐕', uri: '/sounds/animals/dog.mp3' },
            { id: 'cat', name: 'Cat', emoji: '🐈', uri: '/sounds/animals/cat.mp3' },
            { id: 'lion', name: 'Lion', emoji: '🦁', uri: '/sounds/animals/lion.mp3' },
            { id: 'elephant', name: 'Elephant', emoji: '🐘', uri: '/sounds/animals/elephant.mp3' },
            { id: 'monkey', name: 'Monkey', emoji: '🐵', uri: '/sounds/animals/monkey.mp3' },
            { id: 'cow', name: 'Cow', emoji: '🐄', uri: '/sounds/animals/cow.mp3' },
            { id: 'sheep', name: 'Sheep', emoji: '🐑', uri: '/sounds/animals/sheep.mp3' },
            { id: 'bird', name: 'Bird', emoji: '🦅', uri: '/sounds/animals/bird.mp3' },
            { id: 'duck', name: 'Duck', emoji: '🦆', uri: '/sounds/animals/duck.mp3' },
            { id: 'owl', name: 'Owl', emoji: '🦉', uri: '/sounds/animals/owl.mp3' },
            { id: 'frog', name: 'Frog', emoji: '🐸', uri: '/sounds/animals/frog.mp3' },
            { id: 'horse', name: 'Horse', emoji: '🐴', uri: '/sounds/animals/horse.mp3' },
          ],
        },
        {
          id: 'demo-goofy',
          name: 'Goofy Sounds',
          emoji: '😄',
          color: '#f97316',
          desc: 'Silly, funny sounds',
          sounds: [
            { id: 'fart', name: 'Fart', emoji: '💨', uri: '/sounds/goofy/fart.mp3' },
            { id: 'boing', name: 'Boing', emoji: '🎪', uri: '/sounds/goofy/boing.mp3' },
            { id: 'honk', name: 'Honk', emoji: '📯', uri: '/sounds/goofy/honk.mp3' },
            { id: 'whistle', name: 'Whistle', emoji: '🎵', uri: '/sounds/goofy/whistle.mp3' },
            { id: 'spring', name: 'Spring', emoji: '🌀', uri: '/sounds/goofy/spring.mp3' },
            { id: 'slide', name: 'Slide Whistle', emoji: '🎺', uri: '/sounds/goofy/slide.mp3' },
            { id: 'kazoo', name: 'Kazoo', emoji: '🎺', uri: '/sounds/goofy/kazoo.mp3' },
            { id: 'trombone', name: 'Trombone Fail', emoji: '🎺', uri: '/sounds/goofy/trombone.mp3' },
            { id: 'boob', name: 'Boob Honk', emoji: '📯', uri: '/sounds/goofy/boob.mp3' },
            { id: 'laugh', name: 'Cartoon Laugh', emoji: '😂', uri: '/sounds/goofy/laugh.mp3' },
          ],
        },
        {
          id: 'demo-superheroes',
          name: 'Superheroes',
          emoji: '🦸',
          color: '#ef4444',
          desc: 'Action and superhero sound effects',
          sounds: [
            { id: 'pow', name: 'Pow!', emoji: '💥', uri: '/sounds/superheroes/pow.mp3' },
            { id: 'laser', name: 'Laser Zap', emoji: '⚡', uri: '/sounds/superheroes/laser.mp3' },
            { id: 'explosion', name: 'Explosion', emoji: '💣', uri: '/sounds/superheroes/explosion.mp3' },
            { id: 'whoosh', name: 'Whoosh', emoji: '💨', uri: '/sounds/superheroes/whoosh.mp3' },
            { id: 'ding', name: 'Ding!', emoji: '🔔', uri: '/sounds/superheroes/ding.mp3' },
            { id: 'cape', name: 'Cape Swoosh', emoji: '🧥', uri: '/sounds/superheroes/cape.mp3' },
            { id: 'power', name: 'Power Up', emoji: '⚡', uri: '/sounds/superheroes/power.mp3' },
            { id: 'villain', name: 'Villain Laugh', emoji: '😈', uri: '/sounds/superheroes/villain.mp3' },
          ],
        },
        {
          id: 'demo-nature',
          name: 'Nature',
          emoji: '🌲',
          color: '#22c55e',
          desc: 'Natural sounds from the environment',
          sounds: [
            { id: 'rain', name: 'Rain', emoji: '🌧️', uri: '/sounds/nature/rain.mp3' },
            { id: 'thunder', name: 'Thunder', emoji: '⛈️', uri: '/sounds/nature/thunder.mp3' },
            { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', uri: '/sounds/nature/ocean.mp3' },
            { id: 'wind', name: 'Wind', emoji: '💨', uri: '/sounds/nature/wind.mp3' },
            { id: 'birds', name: 'Birds Chirping', emoji: '🐦', uri: '/sounds/nature/birds.mp3' },
            { id: 'stream', name: 'Stream', emoji: '💧', uri: '/sounds/nature/stream.mp3' },
            { id: 'forest', name: 'Forest Ambience', emoji: '🌳', uri: '/sounds/nature/forest.mp3' },
            { id: 'crickets', name: 'Crickets', emoji: '🦗', uri: '/sounds/nature/crickets.mp3' },
            { id: 'waterfall', name: 'Waterfall', emoji: '💦', uri: '/sounds/nature/waterfall.mp3' },
            { id: 'fire', name: 'Campfire', emoji: '🔥', uri: '/sounds/nature/fire.mp3' },
            { id: 'leaves', name: 'Leaves Rustling', emoji: '🍂', uri: '/sounds/nature/leaves.mp3' },
            { id: 'thunder_roll', name: 'Thunder Roll', emoji: '⚡', uri: '/sounds/nature/thunder_roll.mp3' },
          ],
        },
        {
          id: 'demo-vehicles',
          name: 'Vehicles',
          emoji: '🚗',
          color: '#06b6d4',
          desc: 'Vehicle and transportation sounds',
          sounds: [
            { id: 'car_horn', name: 'Car Horn', emoji: '📯', uri: '/sounds/vehicles/car_horn.mp3' },
            { id: 'police_siren', name: 'Police Siren', emoji: '🚔', uri: '/sounds/vehicles/police_siren.mp3' },
            { id: 'fire_truck', name: 'Fire Truck', emoji: '🚒', uri: '/sounds/vehicles/fire_truck.mp3' },
            { id: 'helicopter', name: 'Helicopter', emoji: '🚁', uri: '/sounds/vehicles/helicopter.mp3' },
            { id: 'train_whistle', name: 'Train Whistle', emoji: '🚂', uri: '/sounds/vehicles/train_whistle.mp3' },
            { id: 'airplane', name: 'Airplane', emoji: '✈️', uri: '/sounds/vehicles/airplane.mp3' },
            { id: 'motorcycle', name: 'Motorcycle', emoji: '🏍️', uri: '/sounds/vehicles/motorcycle.mp3' },
            { id: 'doorbell', name: 'Doorbell', emoji: '🚪', uri: '/sounds/vehicles/doorbell.mp3' },
          ],
        },
      ]
      setSoundBoards(demoBoards)
      setActiveBoardId(demoBoards[0].id)
      setLoading(false)
      return
    }

    fetch(`${API}/api/soundboards`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((boards) => {
        setSoundBoards(boards)
        if (boards.length > 0) setActiveBoardId(boards[0].id)
      })
      .catch(() => {
        setError('Failed to load sound boards')
      })
      .finally(() => setLoading(false))
  }, [isDemo])

  const activeBoard = soundBoards.find((b) => b.id === activeBoardId)
  const allSounds = activeBoard?.sounds || []

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        {!isChildMode && (
          <Link
            to={`/dashboard/child/${childId}`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            ← Back
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white leading-none">🔊 Sound Boards</h1>
          {activeBoard && <p className="text-slate-400 text-sm mt-1">{activeBoard.desc}</p>}
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col p-6 sm:p-10">
        {/* Board selector (caregiver mode) */}
        {!isChildMode && (
          <div className="mb-8 flex items-center gap-2 flex-wrap">
            {soundBoards.map((board) => (
              <button
                key={board.id}
                onClick={() => setActiveBoardId(board.id)}
                className={`flex items-center gap-2 px-4 h-10 rounded-xl font-semibold transition-all ${
                  activeBoardId === board.id
                    ? 'bg-[#FFD700] text-[#0f172a]'
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 border border-slate-600'
                }`}
              >
                <span>{board.emoji}</span>
                {board.name}
              </button>
            ))}
          </div>
        )}

        {/* Sound grid */}
        {soundBoards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-7xl mb-4">🔇</span>
            <p className="text-white font-bold text-lg">No sound boards available</p>
            <p className="text-slate-400 text-sm">Contact admin to set up sound boards</p>
          </div>
        ) : (
          <SoundGrid
            sounds={allSounds}
            activeBoard={activeBoard}
            childId={childId}
            isChildMode={isChildMode}
            scanProfile={scanProfile}
          />
        )}

        {isChildMode && (
          <p className="text-slate-600 text-sm mt-8 text-center">
            Spacebar to select · Esc to exit child mode
          </p>
        )}
      </main>
    </div>
  )
}

// Pentatonic-ish scale so any hash → frequency mapping still sounds musical
// rather than clashing. Deterministic (same sound.id always maps to the same
// note/waveform) so playback is consistent for the child, not randomized.
const TONE_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]
const TONE_WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth']

export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Pure mapping from a sound id to a deterministic {freq, type} tone — split
 * out from playDistinctTone so the "different sounds get different tones"
 * behavior is unit-testable without touching the Web Audio API.
 */
export function getToneForSound(soundId) {
  const hash = hashString(soundId)
  return {
    freq: TONE_NOTES[hash % TONE_NOTES.length],
    type: TONE_WAVEFORMS[Math.floor(hash / TONE_NOTES.length) % TONE_WAVEFORMS.length],
  }
}

/**
 * Synthesizes a distinct tone per sound id via Web Audio. This exists only
 * as a fallback for when no real audio file is available at `sound.uri` —
 * see AUDIO_SOURCING_GUIDE.md. Previously every sound played an identical
 * hardcoded 800Hz beep regardless of which tile was pressed; this at least
 * makes each button audibly different from the others until real audio is
 * sourced (real files, once added, are tried first and take priority).
 *
 * Returns a { stop } handle so the caller can cut it short early if a new
 * sound is triggered before this one finishes on its own.
 */
function playDistinctTone(soundId) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  const audioContext = new AudioContextClass()
  const now = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()

  const { freq, type } = getToneForSound(soundId)

  osc.connect(gain)
  gain.connect(audioContext.destination)
  osc.frequency.value = freq
  osc.type = type
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35)

  osc.start(now)
  osc.stop(now + 0.35)

  return {
    stop: () => {
      // osc.stop() throws if the oscillator has already stopped (either it
      // finished naturally or this was already called) — harmless, just
      // means there's nothing left to cut off.
      try { osc.stop() } catch { /* already stopped */ }
      audioContext.close().catch(() => {})
    },
  }
}

export function SoundGrid({ sounds, activeBoard, childId, isChildMode, scanProfile }) {
  // Real audio files can run several seconds — without tracking what's
  // currently playing, starting a new sound would layer on top of the
  // previous one instead of replacing it. This ref holds a uniform
  // { stop() } handle regardless of whether the last sound played as a
  // real <audio> file or the synthesized tone fallback.
  const currentPlaybackRef = useRef(null)
  // Guards against a race: audio.play() is async, so if two sounds are
  // triggered in quick succession, the first one's play() could still
  // resolve *after* the second one has already started and taken over
  // currentPlaybackRef — without this check it would overwrite the ref and
  // keep playing right alongside the newer sound instead of losing to it.
  const playTokenRef = useRef(0)

  const handlePlaySound = async (sound) => {
    // Cut off whatever's still playing before starting the next sound.
    currentPlaybackRef.current?.stop()
    currentPlaybackRef.current = null
    const myToken = ++playTokenRef.current

    // Log play event
    if (activeBoard) {
      fetch(`${API}/api/soundboards/${activeBoard.id}/play`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, soundId: sound.id }),
      }).catch(() => {})
    }

    // Try the real audio file first (works automatically once sourced per
    // AUDIO_SOURCING_GUIDE.md); fall back to a synthesized tone distinct to
    // this specific sound if the file doesn't exist yet.
    //
    // Sound URIs (from seed.js / demo data) are relative paths like
    // "/sounds/instruments/piano.mp3" — they're served as static files by
    // the API server (see server/index.js), NOT the client dev server, so
    // they must be resolved against the API base URL, not left relative
    // (a bare relative URL here would resolve against the client's own
    // origin, which never has anything at that path).
    try {
      const relativePath = sound.uri || `/sounds/${activeBoard?.id}/${sound.id}.mp3`
      const audioUrl = relativePath.startsWith('http') ? relativePath : `${API}${relativePath}`
      const audio = new Audio(audioUrl)
      await audio.play()
      if (playTokenRef.current !== myToken) { audio.pause(); return } // superseded while awaiting
      currentPlaybackRef.current = { stop: () => { audio.pause(); audio.currentTime = 0 } }
    } catch {
      if (playTokenRef.current !== myToken) return // superseded while awaiting
      currentPlaybackRef.current = playDistinctTone(sound.id)
    }
  }

  if (sounds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className="text-6xl mb-3">📭</span>
        <p className="text-slate-400 text-sm">No sounds in this board yet</p>
      </div>
    )
  }

  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
      {sounds.map((sound) =>
        isChildMode ? (
          <ScanItem
            key={sound.id}
            onSelect={() => handlePlaySound(sound)}
            as="div"
            style={{ minWidth: 0, minHeight: 0 }}
            className="rounded-2xl"
          >
            <SoundTile sound={sound} activeBoard={activeBoard} />
          </ScanItem>
        ) : (
          <button
            key={sound.id}
            onClick={() => handlePlaySound(sound)}
            className="rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]"
          >
            <SoundTile sound={sound} activeBoard={activeBoard} />
          </button>
        )
      )}
    </div>
  )

  return isChildMode ? (
    // selectionTone=false: the sound itself IS the confirmation feedback here.
    // The scan engine's own chime layered on top made every spacebar
    // selection sound different from the same tile's mouse-click sound.
    <ScanGroup
      active
      scanSpeedMs={scanProfile.scanSpeedMs}
      highlightColor={scanProfile.scanHighlightColor}
      selectionTone={false}
    >
      {grid}
    </ScanGroup>
  ) : (
    grid
  )
}

function SoundTile({ sound, activeBoard }) {
  const bg = activeBoard?.color || '#a855f7'
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-transparent
                 hover:border-white/20 transition-all w-full"
      style={{ backgroundColor: bg + '22', minHeight: 140 }}
    >
      <span className="text-5xl leading-none" aria-hidden>
        {sound.emoji}
      </span>
      <div className="text-center">
        <p className="text-white font-black text-sm leading-tight">{sound.name}</p>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
      <span className="text-6xl mb-4">⚠️</span>
      <p className="text-white font-bold text-lg">{message}</p>
      <p className="text-slate-400 text-sm mt-2">Please refresh the page or contact support</p>
    </div>
  )
}
