/**
 * StorytimeNarrator — /dashboard/child/:childId/storytime
 *
 * Caregiver picks a Choose-Your-Adventure story, creates a room, shares a code.
 * The narrator (this device) scans through choices at the child's speed.
 * Press SPACE to pick the highlighted choice → advances the story.
 * All listeners see the same node in real-time via socket.
 *
 * States: picking → waiting → active → ended
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { io }         from 'socket.io-client'
import { useScan }    from '../context/ScanContext'
import { useSpeech }  from '../hooks/useSpeech'
import ADVENTURES     from '../stories/adventures'
import { ScanGroup }  from '../components/ScanGroup'
import ScanItem       from '../components/ScanItem'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
const ADV_LIST = Object.values(ADVENTURES)

export default function StorytimeNarrator() {
  const { childId }  = useParams()
  const { isChildMode, scanProfile } = useScan()
  const { speak, cancel } = useSpeech()

  const [uiState, setUiState]       = useState('picking')   // picking|waiting|active|ended
  const [selectedId, setSelectedId] = useState(null)
  const [roomCode, setRoomCode]     = useState('')
  const [nodeKey, setNodeKey]       = useState(null)
  const [listenerCount, setListenerCount] = useState(0)

  const socketRef  = useRef(null)
  const advRef     = useRef(null)
  const nodeKeyRef = useRef(null)
  const spokenRef  = useRef(null)

  const adventure = selectedId ? ADVENTURES[selectedId] : null
  const node      = adventure && nodeKey ? adventure.nodes[nodeKey] : null

  // ── TTS: speak node text when node changes ───────────────────────────────
  useEffect(() => {
    if (!node || uiState !== 'active') return
    if (nodeKey === spokenRef.current) return
    spokenRef.current = nodeKey
    const rate  = scanProfile.voiceRate  || 0.82
    const pitch = scanProfile.voicePitch || 1.0
    setTimeout(() => speak(node.text, { rate, pitch }), 300)
  }, [nodeKey, node, uiState, speak, scanProfile])

  // ── Broadcast current node to all listeners ──────────────────────────────
  function broadcastNode(adv, key) {
    const n = adv.nodes[key]
    if (!n || !socketRef.current) return
    socketRef.current.emit('story-page-change', {
      storyId:     adv.id,
      storyTitle:  adv.title,
      storyEmoji:  adv.emoji,
      nodeKey:     key,
      illustration: n.illustration,
      text:        n.text,
      choices:     n.choices,   // listeners see choices as read-only
      isEnding:    n.isEnding || false,
    })
  }

  // ── Create room once adventure is picked ─────────────────────────────────
  const startSession = useCallback((advId) => {
    setSelectedId(advId)
    const adv = ADVENTURES[advId]
    advRef.current = adv

    const socket = io(SERVER, { withCredentials: true })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('create-story-room', advId, ({ code }) => {
        setRoomCode(code)
        setUiState('waiting')
      })
    })

    const poll = setInterval(() => {
      socket.emit('listener-count', (count) => setListenerCount(count))
    }, 3000)
    socket.on('disconnect', () => clearInterval(poll))

    return () => { socket.disconnect(); clearInterval(poll) }
  }, [])

  // ── Navigate to a node ───────────────────────────────────────────────────
  function goToNode(key) {
    const adv = advRef.current
    if (!adv || !adv.nodes[key]) return
    nodeKeyRef.current = key
    setNodeKey(key)
    broadcastNode(adv, key)
  }

  // ── Spacebar: start story from waiting screen ────────────────────────────
  useEffect(() => {
    function handleKey(e) {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (uiState === 'waiting') {
        const adv = advRef.current
        if (!adv) return
        setUiState('active')
        goToNode(adv.startNode)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [uiState])

  // ── End session ──────────────────────────────────────────────────────────
  function endSession() {
    cancel()
    socketRef.current?.emit('end-story-room')
    socketRef.current?.disconnect()
    setUiState('ended')
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => () => {
    cancel()
    socketRef.current?.emit('end-story-room')
    socketRef.current?.disconnect()
  }, [cancel])

  // ── PICKING ──────────────────────────────────────────────────────────────
  if (uiState === 'picking') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col">
        <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
          <Link to={`/dashboard/child/${childId}/stories`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Stories
          </Link>
          <div>
            <h1 className="text-lg font-black text-white leading-none">🎭 Group Storytime</h1>
            <p className="text-slate-400 text-xs mt-0.5">Pick an adventure — the group will choose the path together</p>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-10">
          <div className="max-w-3xl mx-auto">
            <p className="text-slate-400 text-sm mb-6">
              Choose a story below. You'll get a 4-digit code to share so children can follow along on their own devices. The narrator uses SPACE to select choices — everyone watches the story unfold!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ADV_LIST.map((adv) => (
                <button key={adv.id} onClick={() => startSession(adv.id)}
                  className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-700/60
                             hover:border-white/30 text-left transition-all"
                  style={{ backgroundColor: adv.color + '18' }}>
                  <span className="text-5xl flex-shrink-0">{adv.emoji}</span>
                  <div>
                    <p className="text-white font-black text-sm leading-tight">{adv.title}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {Object.values(adv.nodes).filter(n => n.isEnding).length} possible endings
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── ENDED ─────────────────────────────────────────────────────────────────
  if (uiState === 'ended') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 p-8">
        <span className="text-8xl">📖</span>
        <h1 className="text-3xl font-black text-white">Adventure complete!</h1>
        <p className="text-slate-400 text-lg">Thanks for exploring together.</p>
        <Link to={`/dashboard/child/${childId}/stories`}
          className="px-6 h-12 rounded-xl bg-[#FFD700] text-[#0f172a] font-bold text-base
                     hover:bg-yellow-300 transition-colors flex items-center">
          Back to Stories
        </Link>
      </div>
    )
  }

  // ── WAITING / ACTIVE ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{adventure?.emoji}</span>
          <div>
            <p className="text-white font-black text-base leading-none">{adventure?.title}</p>
            <p className="text-slate-400 text-xs mt-0.5">Group Storytime · Choose-Your-Adventure</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-xs">Room code</span>
            <span className="text-[#FFD700] font-black text-2xl tracking-[0.25em]">{roomCode}</span>
          </div>
          <div className="flex flex-col items-center bg-slate-700/50 rounded-xl px-4 py-2">
            <span className="text-2xl font-black text-white">{listenerCount}</span>
            <span className="text-slate-400 text-xs">listening</span>
          </div>
          {!isChildMode && (
            <button onClick={endSession}
              className="px-4 h-10 rounded-lg bg-red-900/60 text-red-300 text-sm font-semibold
                         hover:bg-red-800/60 transition-colors">
              End session
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
        {uiState === 'waiting' ? (
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-white font-black text-2xl mb-3">Share this code</h2>
            <div className="bg-[#1e293b] rounded-2xl p-6 mb-6 border-2 border-[#FFD700]/30">
              <p className="text-slate-400 text-sm mb-2">Children join at:</p>
              <p className="text-white font-bold text-base mb-3">
                {window.location.origin}/storytime/<span className="text-[#FFD700]">{roomCode}</span>
              </p>
              <p className="text-slate-400 text-sm mb-1">Or enter code:</p>
              <p className="text-[#FFD700] font-black text-5xl tracking-[0.3em]">{roomCode}</p>
            </div>
            {listenerCount > 0 && (
              <p className="text-[#22c55e] font-semibold text-sm mb-4">
                ✓ {listenerCount} listener{listenerCount !== 1 ? 's' : ''} connected
              </p>
            )}
            <p className="text-[#FFD700] font-bold text-lg">Press SPACE to begin the adventure!</p>
            <p className="text-slate-500 text-sm mt-2">(You can start before everyone joins)</p>
          </div>
        ) : node ? (
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            {/* Node illustration + text */}
            <span className="text-8xl leading-none" aria-hidden>{node.illustration}</span>
            <p className="text-white text-xl font-semibold text-center leading-relaxed">
              {node.text}
            </p>

            {/* Choices or ending */}
            {node.isEnding ? (
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="px-6 py-3 rounded-2xl border-2 border-[#FFD700]/50 text-[#FFD700] font-black text-lg text-center">
                  🎉 The End!
                </div>
                {!isChildMode && (
                  <button onClick={endSession}
                    className="px-6 h-11 rounded-xl bg-[#FFD700] text-[#0f172a] font-bold hover:bg-yellow-300 transition-colors">
                    Finish session ✓
                  </button>
                )}
              </div>
            ) : node.choices ? (
              <div className="w-full">
                <p className="text-slate-400 text-sm text-center mb-4">
                  {isChildMode ? 'Press SPACE to choose!' : 'Click a choice or use SPACE in child mode'}
                </p>
                {isChildMode ? (
                  <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs}
                    highlightColor={scanProfile.scanHighlightColor}>
                    <div className="flex flex-col gap-3">
                      {node.choices.map((choice) => (
                        <ScanItem key={choice.next} onSelect={() => goToNode(choice.next)}
                          as="div" style={{ minWidth: 0, minHeight: 0 }} className="rounded-2xl">
                          <ChoiceButton label={choice.label} />
                        </ScanItem>
                      ))}
                    </div>
                  </ScanGroup>
                ) : (
                  <div className="flex flex-col gap-3">
                    {node.choices.map((choice) => (
                      <button key={choice.next} onClick={() => goToNode(choice.next)}
                        className="w-full px-6 h-14 rounded-2xl bg-[#1e293b] border-2 border-slate-600
                                   hover:border-[#FFD700] hover:text-[#FFD700] text-white font-black
                                   text-base transition-all text-left">
                        {choice.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  )
}

function ChoiceButton({ label }) {
  return (
    <div className="flex items-center px-6 h-14 rounded-2xl bg-[#1e293b] border-2 border-slate-600
                    text-white font-black text-base select-none hover:border-slate-400 transition-colors">
      {label}
    </div>
  )
}
