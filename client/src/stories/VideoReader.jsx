/**
 * VideoReader — /dashboard/child/:childId/stories/video/:videoId
 *
 * Plays a read-along video uploaded by a team member. Native <video>
 * controls are mouse/touch-oriented and not operable via single-switch
 * scanning, so playback is driven entirely by a custom Play/Pause + Restart
 * + Back action bar, matching the pattern used by StoryReader/LearnModule.
 */
import { useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'
import { getVideoById } from './videos'

export default function VideoReader() {
  const { childId, videoId } = useParams()
  const navigate = useNavigate()
  const { isChildMode, scanProfile } = useScan()

  const video = getVideoById(videoId)
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      setPlaying(true)
      setEnded(false)
    } else {
      el.pause()
      setPlaying(false)
    }
  }, [])

  const restart = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = 0
    el.play()
    setPlaying(true)
    setEnded(false)
  }, [])

  const goBack = useCallback(() => {
    videoRef.current?.pause()
    if (video?.storyId) {
      navigate(`/dashboard/child/${childId}/stories/${video.storyId}`)
    } else {
      navigate(`/dashboard/child/${childId}/stories`)
    }
  }, [navigate, childId, video])

  if (!video) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-5xl">🎥</div>
        <h1 className="text-white font-black text-xl">Video not found</h1>
        <Link to={`/dashboard/child/${childId}/stories`}
          className="text-[#FFD700] text-sm font-semibold hover:underline">
          ← Back to Stories
        </Link>
      </div>
    )
  }

  const actions = [
    { label: ended ? '🔄 Watch Again' : playing ? '⏸ Pause' : '▶ Play', fn: ended ? restart : togglePlay },
    { label: '🏠 Back', fn: goBack },
  ]

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
          <button onClick={goBack}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Back
          </button>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">🎥 {video.title}</h1>
          <p className="text-slate-400 text-xs mt-0.5">Read by {video.reader}</p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 gap-8">
        <div className="w-full max-w-2xl rounded-2xl overflow-hidden border-2 border-slate-700/60 bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            src={video.videoUrl}
            playsInline
            className="w-full h-auto max-h-[60vh]"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => { setPlaying(false); setEnded(true) }}
          />
        </div>

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
