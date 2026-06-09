/**
 * Beat Builder — coming soon stub
 *
 * Mechanic (planned): A 4×4 step sequencer grid (4 drum sounds × 16 steps).
 * In child mode, scan across the grid to toggle individual steps on/off,
 * then press play to loop through the pattern at a BPM tied to scanSpeedMs.
 */
import { useParams, Link } from 'react-router-dom'
import { useScan } from '../context/ScanContext'

export default function BeatBuilder() {
  const { childId }     = useParams()
  const { isChildMode } = useScan()

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        {!isChildMode && (
          <Link to={`/dashboard/child/${childId}/music`}
            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
            ← Music
          </Link>
        )}
        <div>
          <h1 className="text-lg font-black text-white leading-none">🎛️ Beat Builder</h1>
          <p className="text-slate-400 text-xs mt-0.5">Coming soon</p>
        </div>
        {isChildMode && (
          <span className="ml-auto text-slate-500 text-xs">Esc to exit child mode</span>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6 select-none" aria-hidden>🎛️</div>
          <h2 className="text-2xl font-black text-white mb-3">Coming Soon</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Build your own rhythm loops on a 4-track step sequencer.
            Toggle steps on and off to create a unique beat, then press play!
          </p>

          {/* Decorative mini grid */}
          <div className="grid grid-cols-8 gap-1.5 mb-8" aria-hidden>
            {Array.from({ length: 32 }, (_, i) => (
              <div
                key={i}
                className="h-6 rounded"
                style={{
                  backgroundColor: Math.random() > 0.6 ? '#22c55e' : '#1e293b',
                  opacity: 0.7,
                }}
              />
            ))}
          </div>

          {!isChildMode && (
            <Link
              to={`/dashboard/child/${childId}/music`}
              className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[#1e293b]
                         text-slate-300 text-sm font-semibold border border-slate-700
                         hover:border-slate-500 transition-colors"
            >
              ← Back to Music
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
