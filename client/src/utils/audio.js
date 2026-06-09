let _sharedAudioCtx = null

export function getAudioContext() {
  if (!_sharedAudioCtx || _sharedAudioCtx.state === 'closed') {
    try {
      _sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }

  if (_sharedAudioCtx.state === 'suspended') {
    _sharedAudioCtx.resume().catch(() => {})
  }

  return _sharedAudioCtx
}

function playOscillator({ freq, type = 'sine', duration = 0.12, volume = 0.18, detune = 0, start = 0 }) {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime + start
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = freq
  osc.detune.value = detune

  gain.gain.setValueAtTime(0.001, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.02)
}

function playNoise({ duration = 0.12, volume = 0.18, filterType = 'bandpass', frequency = 1200, q = 1.0, start = 0 }) {
  const ctx = getAudioContext()
  if (!ctx) return

  const len = Math.floor(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i += 1) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.value = frequency
  filter.Q.value = q

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration + start)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  source.start(ctx.currentTime + start)
  source.stop(ctx.currentTime + duration + start + 0.02)
}

export function playCowbellSound() {
  // Bright metallic cowbell tone
  playOscillator({ freq: 256, type: 'sine', duration: 0.14, volume: 0.2 })
  playOscillator({ freq: 540, type: 'square', duration: 0.12, volume: 0.14, start: 0.01 })
  playOscillator({ freq: 812, type: 'triangle', duration: 0.1, volume: 0.1, start: 0.02 })
  // Metallic shimmer
  playNoise({ duration: 0.18, volume: 0.12, filterType: 'highpass', frequency: 4000, q: 1.8, start: 0 })
}

export function playMaracasSound() {
  // Dry shaker rattle with two frequencies
  playNoise({ duration: 0.2, volume: 0.2, filterType: 'bandpass', frequency: 2200, q: 1.2, start: 0 })
  playNoise({ duration: 0.16, volume: 0.15, filterType: 'bandpass', frequency: 4800, q: 1.4, start: 0.04 })
  playNoise({ duration: 0.12, volume: 0.1, filterType: 'highpass', frequency: 8000, q: 1.6, start: 0.08 })
}

export function playTambourineSound() {
  // Jingly cymbal-like with metallic overtones
  playNoise({ duration: 0.22, volume: 0.2, filterType: 'highpass', frequency: 6800, q: 1.2, start: 0 })
  playNoise({ duration: 0.18, volume: 0.14, filterType: 'highpass', frequency: 9200, q: 1.6, start: 0.02 })
  playOscillator({ freq: 1200, type: 'triangle', duration: 0.08, volume: 0.08, start: 0.01 })
  playOscillator({ freq: 2400, type: 'sine', duration: 0.06, volume: 0.06, start: 0.03 })
}

export function playMelodyNote(freq) {
  // Glockenspiel: metallic bars, long bright sustain, inharmonic overtones
  playOscillator({ freq, type: 'sine', duration: 1.4, volume: 0.20 })
  playOscillator({ freq: freq * 2.76, type: 'sine', duration: 0.70, volume: 0.09, start: 0.004 })
  playOscillator({ freq: freq * 5.4,  type: 'sine', duration: 0.28, volume: 0.04, start: 0.008 })
  // Metallic mallet strike
  playNoise({ duration: 0.025, volume: 0.14, filterType: 'highpass', frequency: 7000, q: 1.6, start: 0 })
}

export function playBellTowerNote(freq) {
  // Rich bell tone with metallic resonance
  playOscillator({ freq, type: 'sine', duration: 0.64, volume: 0.18 })
  playOscillator({ freq: freq * 2, type: 'sine', duration: 0.5, volume: 0.09, start: 0.04, detune: 3 })
  playOscillator({ freq: freq * 3, type: 'sine', duration: 0.42, volume: 0.06, start: 0.08, detune: -2 })
  playOscillator({ freq: freq * 0.5, type: 'sine', duration: 0.56, volume: 0.06, start: 0.06 })
  // Bell strike metallic shimmer
  playNoise({ duration: 0.28, volume: 0.08, filterType: 'bandpass', frequency: 3200, q: 1.2, start: 0.02 })
}

export function playPianoNote(freq) {
  // Bright hammer strike with harmonic decay
  playOscillator({ freq, type: 'sine', duration: 0.48, volume: 0.2, detune: 0 })
  playOscillator({ freq: freq * 2, type: 'sine', duration: 0.38, volume: 0.09, start: 0.01 })
  playOscillator({ freq: freq * 3, type: 'sine', duration: 0.28, volume: 0.05, start: 0.03 })
  playOscillator({ freq: freq * 4, type: 'sine', duration: 0.18, volume: 0.03, start: 0.05 })
  // Hammer transient
  playNoise({ duration: 0.06, volume: 0.08, filterType: 'highpass', frequency: 2000, q: 1.2, start: 0 })
}

export function playFluteNote(freq) {
  // Warm, breathy tone with breath noise
  playOscillator({ freq, type: 'sine', duration: 0.42, volume: 0.14, detune: -8 })
  playOscillator({ freq: freq * 2, type: 'sine', duration: 0.32, volume: 0.06, start: 0.04, detune: 6 })
  // Breath noise - distinctive flute characteristic
  playNoise({ duration: 0.3, volume: 0.07, filterType: 'bandpass', frequency: 800, q: 1.4, start: 0 })
  playNoise({ duration: 0.26, volume: 0.04, filterType: 'highpass', frequency: 2400, q: 1.6, start: 0.05 })
}

export function playPanFluteNote(freq) {
  // Pan flute: warmer and more harmonic than regular flute
  playOscillator({ freq, type: 'sine', duration: 0.38, volume: 0.16, detune: 2 })
  playOscillator({ freq: freq * 1.5, type: 'sine', duration: 0.32, volume: 0.08, start: 0.02, detune: -3 })
  playOscillator({ freq: freq * 2, type: 'sine', duration: 0.26, volume: 0.05, start: 0.05 })
  // Warmer breath
  playNoise({ duration: 0.28, volume: 0.06, filterType: 'lowpass', frequency: 1600, q: 1.3, start: 0.02 })
}

export function playStringNote(freq) {
  // Violin: warm, singing tone with bow-like sustain
  playOscillator({ freq, type: 'sawtooth', duration: 0.5, volume: 0.15, detune: 3 })
  playOscillator({ freq: freq * 2, type: 'sawtooth', duration: 0.42, volume: 0.07, start: 0.02, detune: -2 })
  playOscillator({ freq: freq * 3, type: 'sine', duration: 0.32, volume: 0.04, start: 0.04 })
  // Bow friction
  playNoise({ duration: 0.28, volume: 0.04, filterType: 'lowpass', frequency: 1000, q: 1.8, start: 0.03 })
}

export function playCelloNote(freq) {
  // Cello: deep, rich, warm sustain
  playOscillator({ freq, type: 'sawtooth', duration: 0.56, volume: 0.17, detune: -3 })
  playOscillator({ freq: freq * 1.5, type: 'sine', duration: 0.48, volume: 0.08, start: 0.03, detune: 2 })
  playOscillator({ freq: freq * 2, type: 'sine', duration: 0.38, volume: 0.05, start: 0.06 })
  // Bow transient
  playNoise({ duration: 0.32, volume: 0.05, filterType: 'lowpass', frequency: 800, q: 2.0, start: 0.04 })
}

export function playXylophoneNote(freq) {
  // Wooden bar: inharmonic overtones (2.76× and 5.4× fundamental), audible sustain
  playOscillator({ freq, type: 'sine', duration: 0.65, volume: 0.22 })
  playOscillator({ freq: freq * 2.76, type: 'sine', duration: 0.28, volume: 0.10, start: 0.004 })
  playOscillator({ freq: freq * 5.4,  type: 'sine', duration: 0.12, volume: 0.05, start: 0.008 })
  // Mallet click
  playNoise({ duration: 0.022, volume: 0.18, filterType: 'bandpass', frequency: 3500, q: 1.2, start: 0 })
}

export function playGongHit() {
  // Deep, resonant gong strike with long sustain
  playOscillator({ freq: 56, type: 'sine', duration: 1.0, volume: 0.18 })
  playOscillator({ freq: 112, type: 'triangle', duration: 0.8, volume: 0.1, start: 0.02 })
  playOscillator({ freq: 168, type: 'sine', duration: 0.7, volume: 0.08, start: 0.04 })
  playOscillator({ freq: 224, type: 'sine', duration: 0.6, volume: 0.06, start: 0.06 })
  // Metallic attack
  playNoise({ duration: 0.28, volume: 0.1, filterType: 'bandpass', frequency: 2000, q: 0.9, start: 0 })
}

// ---------------------------------------------------------------------------
// Drum kit — proper synthesis with pitch envelopes
// ---------------------------------------------------------------------------

export function playDrumKick() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.frequency.setValueAtTime(160, now)
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.4)
  g.gain.setValueAtTime(0.9, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
  osc.connect(g); g.connect(ctx.destination)
  osc.start(now); osc.stop(now + 0.46)
  playNoise({ duration: 0.02, volume: 0.2, filterType: 'highpass', frequency: 2000, q: 0.8 })
}

export function playDrumSnare() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  // Noise layer (snare rattle)
  const nLen = Math.floor(ctx.sampleRate * 0.22)
  const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate)
  const nData = nBuf.getChannelData(0)
  for (let i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1
  const nSrc = ctx.createBufferSource()
  nSrc.buffer = nBuf
  const nFilter = ctx.createBiquadFilter()
  nFilter.type = 'bandpass'; nFilter.frequency.value = 1800; nFilter.Q.value = 0.7
  const nGain = ctx.createGain()
  nGain.gain.setValueAtTime(0.7, now)
  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
  nSrc.connect(nFilter); nFilter.connect(nGain); nGain.connect(ctx.destination)
  nSrc.start(now); nSrc.stop(now + 0.23)
  // Body tone
  const osc = ctx.createOscillator()
  const tg = ctx.createGain()
  osc.frequency.value = 200
  tg.gain.setValueAtTime(0.5, now)
  tg.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
  osc.connect(tg); tg.connect(ctx.destination)
  osc.start(now); osc.stop(now + 0.08)
}

export function playDrumHiHat() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const len = Math.floor(ctx.sampleRate * 0.09)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'; filter.frequency.value = 8500; filter.Q.value = 1.8
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.5, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
  src.connect(filter); filter.connect(g); g.connect(ctx.destination)
  src.start(now); src.stop(now + 0.1)
}

export function playDrumTom() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.frequency.setValueAtTime(110, now)
  osc.frequency.exponentialRampToValueAtTime(48, now + 0.35)
  g.gain.setValueAtTime(0.8, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
  osc.connect(g); g.connect(ctx.destination)
  osc.start(now); osc.stop(now + 0.4)
}

export function playDrumCrash() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const len = Math.floor(ctx.sampleRate * 1.2)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'; filter.frequency.value = 5000; filter.Q.value = 0.4
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.35, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
  src.connect(filter); filter.connect(g); g.connect(ctx.destination)
  src.start(now); src.stop(now + 1.22)
}

export function playDrumClap() {
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.012
    const len = Math.floor(ctx.sampleRate * 0.06)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let j = 0; j < len; j++) data[j] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'; filter.frequency.value = 1400; filter.Q.value = 0.9
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.45, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    src.connect(filter); filter.connect(g); g.connect(ctx.destination)
    src.start(t); src.stop(t + 0.07)
  }
}

export function playClickSound() {
  playOscillator({ freq: 880, type: 'sine', duration: 0.08, volume: 0.16 })
}

export function playPopSound() {
  playNoise({ duration: 0.1, volume: 0.16, filterType: 'highpass', frequency: 3000, q: 1.5 })
  playOscillator({ freq: 660, type: 'triangle', duration: 0.08, volume: 0.12, start: 0.02 })
}

export function playCatchSound() {
  playOscillator({ freq: 440, type: 'triangle', duration: 0.14, volume: 0.18 })
  playOscillator({ freq: 660, type: 'triangle', duration: 0.08, volume: 0.14, start: 0.04 })
}

export function playLaunchSound() {
  playOscillator({ freq: 240, type: 'sawtooth', duration: 0.18, volume: 0.2 })
  playOscillator({ freq: 520, type: 'sine', duration: 0.1, volume: 0.14, start: 0.06 })
}

export function playSuccessSound() {
  playOscillator({ freq: 520, type: 'sine', duration: 0.12, volume: 0.18 })
  playOscillator({ freq: 660, type: 'sine', duration: 0.12, volume: 0.16, start: 0.04 })
}

export { playOscillator, playNoise }
