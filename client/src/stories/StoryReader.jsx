/**
 * StoryReader — /dashboard/child/:childId/stories/:storyId
 *
 * Page-by-page read-aloud story viewer with progress saving.
 * Progress is saved to localStorage per child+story so they can resume later.
 *
 * Child mode: ScanGroup cycles two action buttons (Read Again / Next Page).
 * Caregiver mode: visible prev/next buttons.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'
import { useSpeech } from '../hooks/useSpeech'
import STORIES from './index'
import { getVideosForStory } from './videos'

// ---------------------------------------------------------------------------
// Progress persistence
// ---------------------------------------------------------------------------
function progressKey(childId, storyId) { return `ag-story-${childId}-${storyId}` }

function loadProgress(childId, storyId) {
  try {
    const v = localStorage.getItem(progressKey(childId, storyId))
    return v !== null ? parseInt(v, 10) : 0
  } catch { return 0 }
}

function saveProgress(childId, storyId, pageIndex) {
  try { localStorage.setItem(progressKey(childId, storyId), String(pageIndex)) } catch { /* noop */ }
}

function clearProgress(childId, storyId) {
  try { localStorage.removeItem(progressKey(childId, storyId)) } catch { /* noop */ }
}

// ---------------------------------------------------------------------------
// Page dots
// ---------------------------------------------------------------------------
function PageDots({ total, current }) {
  return (
    <div className="flex gap-2 justify-center flex-wrap" aria-label={`Page ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{
            width:  i === current ? 20 : 8,
            height: 8,
            backgroundColor: i === current ? '#FFD700' : i < current ? 'rgba(255,213,0,0.35)' : 'rgba(255,255,255,0.15)',
          }} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function StoryReader() {
  const { childId, storyId } = useParams()
  const navigate = useNavigate()
  const { isChildMode, scanProfile } = useScan()
  const { speak, cancel } = useSpeech()

  const story = STORIES[storyId]

  // Load saved progress on first mount
  const [pageIndex, setPageIndex] = useState(() => loadProgress(childId, storyId))
  const [reading, setReading]     = useState(false)
  const [transition, setTransition] = useState(false)
  const prevPageRef = useRef(-1)

  const isLastPage = story ? pageIndex === story.pages.length - 1 : false

  // Save progress whenever page changes
  useEffect(() => {
    if (!story) return
    saveProgress(childId, storyId, pageIndex)
  }, [childId, storyId, pageIndex, story])

  // TTS: speak whenever page changes
  useEffect(() => {
    if (!story) return
    if (prevPageRef.current === pageIndex) return
    prevPageRef.current = pageIndex

    setReading(true)
    speak(story.pages[pageIndex].text, {
      rate:  scanProfile.voiceRate,
      pitch: scanProfile.voicePitch,
    })
    const wordCount = story.pages[pageIndex].text.split(/\s+/).length
    const ms = (wordCount / (scanProfile.voiceRate * 2.5)) * 1000
    const t = setTimeout(() => setReading(false), ms)
    return () => clearTimeout(t)
  }, [pageIndex, story, speak, scanProfile.voiceRate, scanProfile.voicePitch])

  // Page transition animation
  function changePage(nextIdx) {
    cancel()
    setTransition(true)
    setTimeout(() => { setPageIndex(nextIdx); setTransition(false) }, 180)
  }

  const readAgain = useCallback(() => {
    cancel()
    if (!story) return
    prevPageRef.current = -1
    setReading(true)
    speak(story.pages[pageIndex].text, {
      rate:  scanProfile.voiceRate,
      pitch: scanProfile.voicePitch,
    })
    const wordCount = story.pages[pageIndex].text.split(/\s+/).length
    const ms = (wordCount / (scanProfile.voiceRate * 2.5)) * 1000
    setTimeout(() => setReading(false), ms)
  }, [story, pageIndex, cancel, speak, scanProfile.voiceRate, scanProfile.voicePitch])

  const goNext = useCallback(() => {
    if (!story) return
    if (isLastPage) {
      cancel()
      clearProgress(childId, storyId)   // finished! clear saved position
      navigate(`/dashboard/child/${childId}/stories`)
    } else {
      changePage(pageIndex + 1)
    }
  }, [story, isLastPage, pageIndex, childId, storyId, cancel, navigate])

  // Not found
  if (!story) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">📖</div>
        <h1 className="text-white font-black text-xl">Story not found</h1>
        <Link to={`/dashboard/child/${childId}/stories`}
          className="text-[#FFD700] text-sm font-semibold hover:underline">
          ← Back to Stories
        </Link>
      </div>
    )
  }

  const page = story.pages[pageIndex]
  const actionReadAgain = { label: '🔄 Read Again',      fn: readAgain }
  const actionNext      = isLastPage
    ? { label: '🏠 Back to Stories', fn: goNext }
    : { label: '→ Next Page',        fn: goNext }

  // Team-uploaded read-along videos for this story (see stories/videos.js) —
  // offered as an extra option alongside text+TTS, not a replacement for it.
  const videoActions = getVideosForStory(story.id).map((v) => ({
    label: `🎥 Watch ${v.reader} read this`,
    fn: () => { cancel(); navigate(`/dashboard/child/${childId}/stories/video/${v.id}`) },
  }))

  const actions = [actionReadAgain, actionNext, ...videoActions]

  const actionBar = isChildMode ? (
    <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs} highlightColor={scanProfile.scanHighlightColor}>
      <div className="flex gap-4 justify-center flex-wrap">
        {actions.map((action) => (
          <ScanItem key={action.label} onSelect={action.fn} as="div"
            style={{ minWidth: 0, minHeight: 0 }} className="rounded-2xl">
            <ActionButton label={action.label} />
          </ScanItem>
        ))}
      </div>
    </ScanGroup>
  ) : (
    <div className="flex gap-3 justify-center flex-wrap">
      {pageIndex > 0 && (
        <button onClick={() => changePage(pageIndex - 1)}
          className="px-5 h-11 rounded-xl bg-[#1e293b] text-slate-300 text-sm font-semibold
                     border border-slate-700 hover:border-slate-500 transition-colors">
          ← Prev
        </button>
      )}
      {actions.map((action) => (
        <button key={action.label} onClick={action.fn}
          className="px-6 h-11 rounded-xl bg-[#1e293b] text-white text-sm font-semibold
                     border border-slate-600 hover:border-slate-400 transition-colors">
          {action.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/stories`} onClick={() => cancel()}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Stories
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">
            {story.emoji} {story.title}
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Page {pageIndex + 1} of {story.pages.length}
            {reading && <span className="ml-2 text-[#FFD700] animate-pulse">🔊 Reading…</span>}
          </p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 gap-8">
        {/* Illustration */}
        <div className="text-8xl sm:text-9xl leading-none select-none transition-opacity duration-150"
          style={{ opacity: transition ? 0 : 1 }} aria-hidden>
          {page.illustration}
        </div>

        {/* Page text */}
        <div className="max-w-2xl w-full transition-opacity duration-150"
          style={{ opacity: transition ? 0 : 1 }}>
          <p className="text-white text-center leading-relaxed font-medium"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
            {page.text}
          </p>
        </div>

        <PageDots total={story.pages.length} current={pageIndex} />

        <div className="w-full max-w-md">{actionBar}</div>
      </main>
    </div>
  )
}

function ActionButton({ label }) {
  return (
    <div className="flex items-center justify-center px-6 h-14 rounded-2xl
                    bg-[#1e293b] border-2 border-slate-600 select-none
                    text-white font-black text-base whitespace-nowrap
                    hover:border-slate-400 transition-colors"
      style={{ minWidth: 160 }}>
      {label}
    </div>
  )
}
