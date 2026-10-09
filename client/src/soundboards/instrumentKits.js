/**
 * Instrument kits — the single-instrument sound boards reachable from the
 * Sound Boards page (/dashboard/child/:childId/sound-boards/instruments/:kitId).
 *
 * Unlike the main boards (which come from the DB / demo data), these are a
 * static catalog: every kit is one instrument broken into its individual
 * sounds — the drums of a drum kit, the keys of a piano, and so on.
 *
 * Audio files live in server/public/sounds/instrument-kits/<kit id>/<sound id>.mp3
 * and are served by the API at the `uri` below. Until a file is sourced,
 * SoundGrid falls back to a synthesized tone — `freq` (when given) sets that
 * tone's pitch so pitched kits like the piano still play the right note.
 */

const kitUri = (kitId, soundId) => `/sounds/instrument-kits/${kitId}/${soundId}.mp3`

function makeKit({ id, sounds, ...rest }) {
  return {
    id,
    ...rest,
    sounds: sounds.map((s) => ({ ...s, uri: kitUri(id, s.id) })),
  }
}

export const INSTRUMENT_KITS = [
  makeKit({
    id: 'drum-kit',
    name: 'Drum Kit',
    emoji: '🥁',
    color: '#ef4444',
    desc: 'Every drum and cymbal in a drum kit',
    sounds: [
      { id: 'kick',      name: 'Kick Drum',  emoji: '🥁' },
      { id: 'snare',     name: 'Snare Drum', emoji: '🪘' },
      { id: 'hi-hat',    name: 'Hi-Hat',     emoji: '🔔' },
      { id: 'high-tom',  name: 'High Tom',   emoji: '🥁' },
      { id: 'low-tom',   name: 'Low Tom',    emoji: '🥁' },
      { id: 'floor-tom', name: 'Floor Tom',  emoji: '🪘' },
      { id: 'crash',     name: 'Crash',      emoji: '💥' },
      { id: 'ride',      name: 'Ride',       emoji: '✨' },
    ],
  }),
  makeKit({
    id: 'piano',
    name: 'Piano',
    emoji: '🎹',
    color: '#22c55e',
    desc: 'One octave of piano keys, C to C',
    sounds: [
      { id: 'c4', name: 'Do', label: 'C', freq: 261.63 },
      { id: 'd4', name: 'Re', label: 'D', freq: 293.66 },
      { id: 'e4', name: 'Mi', label: 'E', freq: 329.63 },
      { id: 'f4', name: 'Fa', label: 'F', freq: 349.23 },
      { id: 'g4', name: 'Sol', label: 'G', freq: 392.0 },
      { id: 'a4', name: 'La', label: 'A', freq: 440.0 },
      { id: 'b4', name: 'Ti', label: 'B', freq: 493.88 },
      { id: 'c5', name: 'High Do', label: 'C', freq: 523.25 },
    ],
  }),
  makeKit({
    id: 'guitar',
    name: 'Guitar',
    emoji: '🎸',
    color: '#f59e0b',
    desc: 'Each guitar string, plus a big strum',
    sounds: [
      { id: 'low-e',  name: 'Low E String', label: 'E', freq: 82.41 },
      { id: 'a',      name: 'A String',     label: 'A', freq: 110.0 },
      { id: 'd',      name: 'D String',     label: 'D', freq: 146.83 },
      { id: 'g',      name: 'G String',     label: 'G', freq: 196.0 },
      { id: 'b',      name: 'B String',     label: 'B', freq: 246.94 },
      { id: 'high-e', name: 'High E String', label: 'e', freq: 329.63 },
      { id: 'strum',  name: 'Strum',        emoji: '🎸' },
    ],
  }),
  makeKit({
    id: 'xylophone',
    name: 'Xylophone',
    emoji: '🌈',
    color: '#a855f7',
    desc: 'Eight bright xylophone bars',
    sounds: [
      { id: 'c', name: 'Red Bar',    emoji: '🟥', freq: 523.25 },
      { id: 'd', name: 'Orange Bar', emoji: '🟧', freq: 587.33 },
      { id: 'e', name: 'Yellow Bar', emoji: '🟨', freq: 659.25 },
      { id: 'f', name: 'Green Bar',  emoji: '🟩', freq: 698.46 },
      { id: 'g', name: 'Blue Bar',   emoji: '🟦', freq: 783.99 },
      { id: 'a', name: 'Purple Bar', emoji: '🟪', freq: 880.0 },
      { id: 'b', name: 'Pink Bar',   emoji: '🩷', freq: 987.77 },
      { id: 'high-c', name: 'High Red Bar', emoji: '🟥', freq: 1046.5 },
    ],
  }),
]

export function getInstrumentKit(kitId) {
  return INSTRUMENT_KITS.find((k) => k.id === kitId) ?? null
}
