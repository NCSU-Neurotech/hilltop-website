/**
 * ChildCard — child profile card shown in the Dashboard grid
 *
 * Props:
 *   child      — child object from API
 *   onClick()  — navigate to child hub
 *   onEdit()   — open edit modal (pencil button)
 */
import { AVATARS } from './ChildModal'

const AVATAR_MAP = Object.fromEntries(AVATARS.map(({ id, emoji }) => [id, emoji]))

export default function ChildCard({ child, onClick, onEdit }) {
  const emoji = AVATAR_MAP[child.avatarId] ?? '🧒'
  const color = child.scanHighlightColor || '#FFD700'

  return (
    <div className="group relative bg-[#1e293b] rounded-2xl border-2 border-transparent
                    hover:border-[#FFD700]/50 transition-all">

      {/* Edit pencil — caregiver only, appears on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onEdit() }}
        aria-label={`Edit ${child.firstName}'s profile`}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-lg bg-slate-700/80 text-slate-400
                   hover:bg-slate-600 hover:text-white transition-all
                   opacity-0 group-hover:opacity-100 flex items-center justify-center text-sm"
      >
        ✏️
      </button>

      {/* Main clickable area → goes to child hub */}
      <button
        onClick={onClick}
        className="w-full flex flex-col items-center gap-3 p-5 text-center min-h-[140px]
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] rounded-2xl"
      >
        {/* Avatar circle — tinted with the child's highlight color */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: color + '33' }}
        >
          {emoji}
        </div>

        <div>
          <p className="text-white font-bold text-base leading-tight">{child.firstName}</p>
          <p className="text-slate-400 text-sm mt-0.5">Age {child.age}</p>
          {/* Speed badge */}
          <p
            className="text-xs mt-1.5 px-2 py-0.5 rounded-full font-semibold inline-block"
            style={{ backgroundColor: color + '22', color }}
          >
            {child.scanSpeedMs}ms scan
          </p>
        </div>
      </button>
    </div>
  )
}
