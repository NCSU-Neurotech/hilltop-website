/**
 * InstrumentKitPage — /dashboard/child/:childId/sound-boards/instruments/:kitId
 *
 * A sound board for a single instrument (drum kit, piano keys, ...), opened
 * by the caregiver from the Instrument Pages section of SoundBoards. Unlike
 * the main boards, this page scans automatically as soon as it opens — in
 * caregiver mode too — so the caregiver can click in and hand it straight to
 * the child. Spacebar plays the highlighted sound; clicks still work.
 *
 * Sounds come from soundboards/instrumentKits.js. Missing mp3 files fall
 * back to a synthesized tone (see SoundGrid), so the page is usable before
 * the real audio is sourced.
 */
import { useParams, Link, Navigate } from 'react-router-dom'
import { useScan } from '../context/ScanContext'
import { SoundGrid } from './SoundBoards'
import { getInstrumentKit } from '../soundboards/instrumentKits'

export default function InstrumentKitPage() {
  const { childId, kitId } = useParams()
  const { isChildMode, scanProfile } = useScan()
  const kit = getInstrumentKit(kitId)

  if (!kit) return <Navigate to={`/dashboard/child/${childId}/sound-boards`} replace />

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        {!isChildMode && (
          <Link
            to={`/dashboard/child/${childId}/sound-boards`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            ← Sound Boards
          </Link>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white leading-none">
            {kit.emoji} {kit.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">{kit.desc}</p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col p-6 sm:p-10">
        {/* isChildMode is SoundGrid's "scan this grid" switch — always on here
            so the page starts scanning by itself. */}
        <SoundGrid
          sounds={kit.sounds}
          activeBoard={kit}
          childId={childId}
          isChildMode
          scanProfile={scanProfile}
          logPlays={false}
        />

        <p className="text-slate-600 text-sm mt-8 text-center">
          Spacebar to play the highlighted sound
          {isChildMode && ' · Esc to exit child mode'}
        </p>
      </main>
    </div>
  )
}
