/**
 * Stories hub — /dashboard/child/:childId/stories
 *
 * Lists 10 classic childhood stories with resume-progress badges.
 * Child mode: ScanGroup wraps tiles. Caregiver mode: Group Storytime launcher shown.
 */
import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { ScanGroup } from '../components/ScanGroup'
import ScanItem from '../components/ScanItem'
import STORIES_DATA from '../stories/index'

// Build the list from the data source so page counts are always accurate
const STORIES = Object.values(STORIES_DATA)

function progressKey(childId, storyId) { return `ag-story-${childId}-${storyId}` }

export default function Stories() {
  const { childId } = useParams()
  const navigate    = useNavigate()
  const { isChildMode, scanProfile } = useScan()

  // Check localStorage for saved progress per story
  const resumeMap = useMemo(() => {
    const map = {}
    STORIES.forEach((s) => {
      try {
        const v = localStorage.getItem(progressKey(childId, s.id))
        if (v !== null) {
          const page = parseInt(v, 10)
          if (page > 0 && page < s.pages.length) map[s.id] = page
        }
      } catch { /* noop */ }
    })
    return map
  }, [childId])

  function goTo(story) {
    navigate(`/dashboard/child/${childId}/stories/${story.id}`)
  }

  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 w-full max-w-4xl">
      {STORIES.map((story) =>
        isChildMode ? (
          <ScanItem key={story.id} onSelect={() => goTo(story)} as="div"
            style={{ minWidth: 0, minHeight: 0 }} className="rounded-2xl">
            <StoryCard story={story} resumePage={resumeMap[story.id]} />
          </ScanItem>
        ) : (
          <button key={story.id} onClick={() => goTo(story)}
            className="rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]">
            <StoryCard story={story} resumePage={resumeMap[story.id]} />
          </button>
        )
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Back
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">📖 Stories</h1>
          <p className="text-slate-400 text-xs mt-0.5">Classic tales read aloud</p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center p-6 sm:p-10 gap-10">
        {/* Stories grid */}
        <section className="w-full flex flex-col items-center gap-4 max-w-4xl">
          {isChildMode ? (
            <ScanGroup active scanSpeedMs={scanProfile.scanSpeedMs} highlightColor={scanProfile.scanHighlightColor}>
              {grid}
            </ScanGroup>
          ) : (
            grid
          )}
        </section>

        {/* Group Storytime (caregiver only) */}
        {!isChildMode && (
          <section className="w-full max-w-4xl">
            <div className="w-full flex items-center gap-3 mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Group Storytime
              </span>
              <div className="flex-1 h-px bg-slate-700/60" />
            </div>
            <div className="flex items-center gap-5 p-5 rounded-2xl border-2 border-slate-700/60"
              style={{ backgroundColor: '#a78bfa18' }}>
              <span className="text-5xl" aria-hidden>🎭</span>
              <div className="flex-1">
                <p className="text-white font-black text-base">Host a Choose-Your-Adventure Session</p>
                <p className="text-slate-400 text-sm mt-0.5">
                  Children join from their own devices. The narrator picks story choices — everyone follows the adventure together!
                </p>
              </div>
              <Link to={`/dashboard/child/${childId}/storytime`}
                className="px-5 h-11 rounded-xl bg-[#a78bfa] text-white font-bold text-sm
                           hover:bg-violet-400 transition-colors flex items-center whitespace-nowrap">
                Start session →
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function StoryCard({ story, resumePage }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl
                    border-2 border-transparent hover:border-white/20 transition-all w-full"
      style={{ backgroundColor: story.color + '22', minHeight: 145 }}>
      {/* Resume badge */}
      {resumePage > 0 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: story.color + 'cc', color: '#fff' }}>
          p.{resumePage + 1}↩
        </div>
      )}
      <span className="text-5xl leading-none" aria-hidden>{story.emoji}</span>
      <div className="text-center">
        <p className="text-white font-black text-sm leading-tight">{story.title}</p>
        <p className="text-slate-400 text-xs mt-1">{story.pages.length} pages</p>
        {resumePage > 0 && (
          <p className="text-xs mt-0.5 font-semibold" style={{ color: story.color }}>
            Resume →
          </p>
        )}
      </div>
    </div>
  )
}
