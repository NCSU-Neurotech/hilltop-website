/**
 * StorytimeListener — /storytime/:code  (public, no login required)
 *
 * A child joins from any device using the 4-digit room code.
 * The server broadcasts the narrator's current story state (illustration, text, choices).
 * Choices are displayed read-only — only the narrator can pick them.
 * SPACE re-reads the current page aloud locally.
 */
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io }        from 'socket.io-client'
import { useSpeech } from '../hooks/useSpeech'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export default function StorytimeListener() {
  const { code }  = useParams()
  const { speak, cancel } = useSpeech()

  const [uiState, setUiState] = useState('connecting')   // connecting|unlocking|active|ended|error
  const [storyState, setStoryState] = useState(null)     // {illustration, text, choices, isEnding, storyTitle, storyEmoji}
  const [errorMsg,  setErrorMsg]  = useState('')

  const stateRef      = useRef(null)
  const spokenKeyRef  = useRef(null)
  const socketRef     = useRef(null)
  const audioUnlocked = useRef(false)

  function speakText(text) {
    if (!text) return
    speak(text, { rate: 0.82, pitch: 1.0 })
  }

  // Connect + subscribe
  useEffect(() => {
    const socket = io(SERVER)
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('join-story-room', code, (res) => {
        if (res.error) { setErrorMsg(res.error); setUiState('error'); return }
        // Server sends back current state if story is already in progress
        if (res.currentState) {
          stateRef.current = res.currentState
          setStoryState(res.currentState)
        }
        setUiState('unlocking')
      })
    })

    socket.on('story-state', (state) => {
      stateRef.current = state
      setStoryState(state)
      // Speak if audio is unlocked and this is a new node
      const key = state.nodeKey ?? state.pageIndex ?? 'page'
      if (audioUnlocked.current && key !== spokenKeyRef.current) {
        spokenKeyRef.current = key
        speakText(state.text)
      }
    })

    socket.on('story-ended', () => { cancel(); setUiState('ended') })

    socket.on('connect_error', () => {
      setErrorMsg('Could not connect to the server. Please check your internet connection.')
      setUiState('error')
    })

    return () => { cancel(); socket.disconnect() }
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  // Spacebar = unlock audio on first press, or re-read on subsequent presses
  useEffect(() => {
    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()

      if (uiState === 'unlocking') {
        audioUnlocked.current = true
        setUiState('active')
        const s = stateRef.current
        if (s) {
          const key = s.nodeKey ?? s.pageIndex ?? 'page'
          spokenKeyRef.current = key
          speakText(s.text)
        }
        return
      }

      if (uiState === 'active') {
        const s = stateRef.current
        if (s) speakText(s.text)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [uiState]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Error ──────────────────────────────────────────────────────────────────
  if (uiState === 'error') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-8 text-center gap-6">
        <span className="text-7xl">😕</span>
        <h1 className="text-2xl font-black text-white">Couldn't join</h1>
        <p className="text-slate-400 text-base max-w-sm">{errorMsg}</p>
      </div>
    )
  }

  // ── Connecting ─────────────────────────────────────────────────────────────
  if (uiState === 'connecting') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-base">Joining room {code}…</p>
        </div>
      </div>
    )
  }

  // ── Ended ──────────────────────────────────────────────────────────────────
  if (uiState === 'ended') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <span className="text-8xl">📖</span>
        <h1 className="text-3xl font-black text-white">Adventure complete!</h1>
        <p className="text-slate-400 text-lg">Thanks for listening!</p>
      </div>
    )
  }

  // ── Unlock prompt ──────────────────────────────────────────────────────────
  if (uiState === 'unlocking') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <span className="text-8xl">{storyState?.storyEmoji || '🎭'}</span>
        <h1 className="text-2xl font-black text-white">{storyState?.storyTitle || 'Story time!'}</h1>
        <p className="text-slate-400 text-base">Get ready to follow the adventure!</p>
        <button
          onClick={() => {
            audioUnlocked.current = true
            setUiState('active')
            const s = stateRef.current
            if (s) {
              const key = s.nodeKey ?? s.pageIndex ?? 'page'
              spokenKeyRef.current = key
              speakText(s.text)
            }
          }}
          className="px-8 h-16 rounded-2xl bg-[#FFD700] text-[#0f172a] font-black text-xl
                     hover:bg-yellow-300 active:scale-95 transition-all">
          Tap to start listening
        </button>
        <p className="text-slate-500 text-sm">Or press SPACE</p>
      </div>
    )
  }

  // ── Active ─────────────────────────────────────────────────────────────────
  const s = storyState
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        <span className="text-3xl">{s?.storyEmoji || '🎭'}</span>
        <div>
          <p className="text-white font-black text-base leading-none">{s?.storyTitle || 'Group Storytime'}</p>
          <p className="text-slate-400 text-xs mt-0.5">Listening · Room {code}</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 gap-8">
        {/* Illustration */}
        <span className="text-9xl leading-none" aria-hidden>{s?.illustration}</span>

        {/* Story text */}
        <p className="text-white text-2xl sm:text-3xl font-semibold text-center leading-relaxed max-w-2xl">
          {s?.text}
        </p>

        {/* Choices shown read-only */}
        {s?.choices && !s?.isEnding && (
          <div className="w-full max-w-lg">
            <p className="text-slate-500 text-sm text-center mb-3">The narrator is choosing…</p>
            <div className="flex flex-col gap-3">
              {s.choices.map((choice, i) => (
                <div key={i}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-700/60
                             bg-[#1e293b] text-slate-300 font-semibold text-base text-center">
                  {choice.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {s?.isEnding && (
          <div className="px-6 py-3 rounded-2xl border-2 border-[#FFD700]/50 text-[#FFD700] font-black text-lg">
            🎉 The End!
          </div>
        )}

        <p className="text-slate-500 text-sm">Press SPACE to hear this page again</p>
      </main>
    </div>
  )
}
