/**
 * Rhythm Tap — coming soon stub
 *
 * Mechanic (planned): Musical notes scroll across the screen on a single
 * track. Press SPACEBAR exactly when a note hits the target zone to score.
 * BPM adapts to scanSpeedMs so children with slower reactions still succeed.
 */
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

export default function RhythmTap() {
  const { childId }   = useParams()
  const { isChildMode } = useScan()

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/games`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Games
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">🥁 Rhythm Tap</h1>
          <p className="text-slate-400 text-xs mt-0.5">Coming soon</p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit</span>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6 select-none" aria-hidden>🥁</div>
          <h2 className="text-2xl font-black text-white mb-3">Coming Soon</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Tap along to the beat! Notes scroll toward the target zone —
            press SPACE at just the right moment to nail the rhythm.
          </p>
          <div className="flex justify-center gap-3 mb-8 select-none" aria-hidden>
            {['🎵', '🎶', '🎵', '🎶', '🎵'].map((n, i) => (
              <span
                key={i}
                className="text-2xl opacity-70 animate-pulse"
                style={{ animationDelay: `${i * 200}ms`, color: '#f97316' }}
              >
                {n}
              </span>
            ))}
          </div>
          {!isChildMode && (
            <Link
              to={`/dashboard/child/${childId}/games`}
              className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[#1e293b]
                         text-slate-300 text-sm font-semibold border border-slate-700
                         hover:border-slate-500 transition-colors"
            >
              ← Back to Games
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
