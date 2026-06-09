import { BrowserRouter, Routes, Route, Navigate, useMatch } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useScan } from './context/ScanContext'

// Pages
import Signup        from './pages/Signup'
import Login         from './pages/Login'
import Dashboard     from './pages/Dashboard'
import ChildHub      from './pages/ChildHub'
import Games         from './pages/Games'
import Learn         from './pages/Learn'
import Stories       from './pages/Stories'
import Music         from './pages/Music'
import Communicate   from './pages/Communicate'

// Games — solo (10 single-switch games)
import SkyJumper     from './games/SkyJumper'
import StarCatcher   from './games/StarCatcher'
import BubblePop     from './games/BubblePop'
import ColorMatch    from './games/ColorMatch'
import WhackAMole    from './games/WhackAMole'
import BalloonFloat  from './games/BalloonFloat'
import FishingGame   from './games/FishingGame'
import RocketLaunch  from './games/RocketLaunch'
import PainterGame   from './games/PainterGame'
import MemoryMatch   from './games/MemoryMatch'

// Games — networked multiplayer (caregiver-only, separate devices)
import NetworkedLobby from './games/NetworkedLobby'

// Instruments
import BeatBuilder  from './instruments/BeatBuilder'
import InstrumentPlayground from './instruments/InstrumentPlayground'

// Stories
import StoryReader          from './stories/StoryReader'
import StorytimeNarrator    from './pages/StorytimeNarrator'
import StorytimeListener    from './pages/StorytimeListener'

// Learn
import LearnModule from './learn/LearnModule'

// ---------------------------------------------------------------------------
// Route guard
// ---------------------------------------------------------------------------

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// ---------------------------------------------------------------------------
// Global escape-to-exit handler
// ---------------------------------------------------------------------------

function ChildModeEscapeHandler() {
  const { isChildMode, exitChildMode } = useScan()
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && isChildMode) exitChildMode()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isChildMode, exitChildMode])
  return null
}

function ChildModeEntryButton() {
  const match = useMatch('/dashboard/child/:childId/*')
  const { isChildMode, activeChild, enterChildMode } = useScan()

  if (!match || isChildMode) return null

  return (
    <button
      onClick={() => enterChildMode(activeChild)}
      className="fixed top-24 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#FFD700] px-4 py-2 text-sm font-semibold text-[#0f172a] shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      aria-label="Enter child mode"
    >
      ▶ Child mode
    </button>
  )
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <ChildModeEscapeHandler />
      <ChildModeEntryButton />
      <Routes>
        {/* Public */}
        <Route path="/"       element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login"  element={<Login />} />

        {/* Storytime listener — public (child joins on any device, no login) */}
        <Route path="/storytime/:code" element={<StorytimeListener />} />

        {/* Protected — dashboard */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/dashboard/child/:childId" element={<RequireAuth><ChildHub /></RequireAuth>} />

        {/* Games hub + 10 solo games */}
        <Route path="/dashboard/child/:childId/games" element={<RequireAuth><Games /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/sky-jumper"    element={<RequireAuth><SkyJumper /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/star-catcher"  element={<RequireAuth><StarCatcher /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/bubble-pop"    element={<RequireAuth><BubblePop /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/color-match"   element={<RequireAuth><ColorMatch /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/whack-a-mole"  element={<RequireAuth><WhackAMole /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/balloon-float" element={<RequireAuth><BalloonFloat /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/fishing-game"  element={<RequireAuth><FishingGame /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/rocket-launch" element={<RequireAuth><RocketLaunch /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/painter-game"  element={<RequireAuth><PainterGame /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/games/memory-match"  element={<RequireAuth><MemoryMatch /></RequireAuth>} />

        {/* Multiplayer — networked only, caregiver-initiated */}
        <Route path="/dashboard/child/:childId/games/online" element={<RequireAuth><NetworkedLobby /></RequireAuth>} />

        {/* Music hub + instruments */}
        <Route path="/dashboard/child/:childId/music"               element={<RequireAuth><Music /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/music/beat-builder"  element={<RequireAuth><BeatBuilder /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/music/:instrumentId" element={<RequireAuth><InstrumentPlayground /></RequireAuth>} />

        {/* Stories hub + reader + storytime */}
        <Route path="/dashboard/child/:childId/stories"                          element={<RequireAuth><Stories /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/stories/:storyId"                 element={<RequireAuth><StoryReader /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/storytime"                        element={<RequireAuth><StorytimeNarrator /></RequireAuth>} />

        {/* Learn hub + modules */}
        <Route path="/dashboard/child/:childId/learn"            element={<RequireAuth><Learn /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/learn/:moduleId"  element={<RequireAuth><LearnModule /></RequireAuth>} />

        {/* Communication board */}
        <Route path="/dashboard/child/:childId/communicate" element={<RequireAuth><Communicate /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
