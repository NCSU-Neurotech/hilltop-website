/**
 * Tone.js sampler loader.
 *
 * Samples are fetched from nbrosowsky/tonejs-instruments (GitHub Pages CDN).
 * Tone.Sampler pitch-shifts between the recorded notes automatically, so only
 * a sparse set of anchor samples is needed per instrument.
 *
 * Usage:
 *   preloadSampler('piano')          // start loading in background
 *   playNote('piano', 'C4', 1.5)    // duration in seconds
 */

import * as Tone from 'tone'

const BASE = 'https://nbrosowsky.github.io/tonejs-instruments/samples/'

// Each entry: { urls: {NoteId: filename}, baseUrl, release (seconds) }
const CONFIGS = {
  piano: {
    urls: {
      A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
      A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
      A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
      A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
      A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
      A5: 'A5.mp3', C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3',
      A6: 'A6.mp3', C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3',
      A7: 'A7.mp3', C8: 'C8.mp3',
    },
    baseUrl: BASE + 'piano/',
    release: 1.0,
  },

  xylophone: {
    urls: {
      G4: 'G4.mp3', C5: 'C5.mp3', G5: 'G5.mp3',
      C6: 'C6.mp3', G6: 'G6.mp3', C7: 'C7.mp3',
    },
    baseUrl: BASE + 'xylophone/',
    release: 0.3,
  },

  harp: {
    urls: {
      A2: 'A2.mp3', A4: 'A4.mp3', A6: 'A6.mp3',
      B1: 'B1.mp3', B3: 'B3.mp3', B5: 'B5.mp3', B6: 'B6.mp3',
      C2: 'C2.mp3', C4: 'C4.mp3', C6: 'C6.mp3',
      D2: 'D2.mp3', D4: 'D4.mp3', D6: 'D6.mp3',
      E2: 'E2.mp3', E4: 'E4.mp3', E6: 'E6.mp3',
      F2: 'F2.mp3', F4: 'F4.mp3', F6: 'F6.mp3',
      G2: 'G2.mp3', G4: 'G4.mp3', G6: 'G6.mp3',
    },
    baseUrl: BASE + 'harp/',
    release: 1.5,
  },

  flute: {
    urls: {
      A5: 'A5.mp3', A6: 'A6.mp3',
      C5: 'C5.mp3', C6: 'C6.mp3',
      E5: 'E5.mp3', E6: 'E6.mp3',
    },
    baseUrl: BASE + 'flute/',
    release: 0.5,
  },

  // Clarinet gives pan flute a distinctly warmer, darker wind timbre vs regular flute
  clarinet: {
    urls: {
      D3: 'D3.mp3', F3: 'F3.mp3', 'A#3': 'Bb3.mp3',
      D4: 'D4.mp3', F4: 'F4.mp3', 'A#4': 'Bb4.mp3',
      D5: 'D5.mp3', F5: 'F5.mp3', 'A#5': 'Bb5.mp3',
    },
    baseUrl: BASE + 'clarinet/',
    release: 0.5,
  },

  violin: {
    urls: {
      A3: 'A3.mp3', A4: 'A4.mp3', A5: 'A5.mp3', A6: 'A6.mp3',
      C4: 'C4.mp3', C5: 'C5.mp3', C6: 'C6.mp3', C7: 'C7.mp3',
      E4: 'E4.mp3', E5: 'E5.mp3', G4: 'G4.mp3',
    },
    baseUrl: BASE + 'violin/',
    release: 0.8,
  },

  cello: {
    urls: {
      E2: 'E2.mp3', E3: 'E3.mp3', E4: 'E4.mp3',
      A2: 'A2.mp3', A3: 'A3.mp3', A4: 'A4.mp3',
      B2: 'B2.mp3', B3: 'B3.mp3', B4: 'B4.mp3',
      C2: 'C2.mp3', C3: 'C3.mp3', C4: 'C4.mp3',
    },
    baseUrl: BASE + 'cello/',
    release: 0.8,
  },
}

// ---------------------------------------------------------------------------
// Sampler cache — one Tone.Sampler per instrument, created on first access
// ---------------------------------------------------------------------------

const cache = {}

function getSampler(name) {
  if (cache[name]) return cache[name]
  const cfg = CONFIGS[name]
  if (!cfg) return null
  const sampler = new Tone.Sampler({
    urls: cfg.urls,
    baseUrl: cfg.baseUrl,
    release: cfg.release,
  }).toDestination()
  cache[name] = sampler
  return sampler
}

/** Call this when an instrument page opens to kick off background loading. */
export function preloadSampler(name) {
  getSampler(name)
}

/**
 * Play a note on a sampler instrument.
 * @param {string} samplerName  Key in CONFIGS (e.g. 'piano', 'xylophone')
 * @param {string} note         Tone.js note name e.g. 'C4', 'D#4'
 * @param {number} duration     Duration in seconds (default 1.5)
 */
export function playNote(samplerName, note, duration = 1.5) {
  Tone.start().then(() => {
    const sampler = getSampler(samplerName)
    if (!sampler) return
    if (sampler.loaded) {
      sampler.triggerAttackRelease(note, duration)
    } else {
      Tone.loaded().then(() => sampler.triggerAttackRelease(note, duration))
    }
  })
}
