import { BrowserRouter, Routes, Route, Navigate, useMatch } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { useScan } from './context/ScanContext'
import { useAccessibility } from './context/AccessibilityContext'
import { getEffectiveDemoChild } from './demo/demoData'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Pages
import Signup                from './pages/Signup'
import Login                 from './pages/Login'
import Dashboard             from './pages/Dashboard'
import ChildHub              from './pages/ChildHub'
import Games                 from './pages/Games'
import Learn                 from './pages/Learn'
import Stories               from './pages/Stories'
import Music                 from './pages/Music'
import Communicate           from './pages/Communicate'
import SoundBoards           from './pages/SoundBoards'
import Settings              from './pages/Settings'

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
import VideoReader          from './stories/VideoReader'
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

// ---------------------------------------------------------------------------
// Accessibility settings sync
//
// AccessibilityProvider is mounted once at the app root and has no idea
// which child is being viewed. Without this, a child's font-size/contrast/
// dark-mode settings would never load on refresh (provider resets to
// hardcoded defaults on every mount) and would bleed into whichever child
// is viewed next (nothing ever re-applies on navigation). This re-loads the
// active child's accessibility settings whenever the child route changes,
// and resets to app defaults when not viewing a specific child at all.
// ---------------------------------------------------------------------------

function AccessibilitySync() {
  const match = useMatch('/dashboard/child/:childId/*')
  const { isDemo } = useAuth()
  const { updateAccessibility } = useAccessibility()
  const childId = match?.params?.childId

  useEffect(() => {
    if (!childId) {
      updateAccessibility({ fontSizeRem: 1.0, highContrastMode: false, darkModeOverride: null })
      return
    }

    if (isDemo) {
      const effective = getEffectiveDemoChild(childId)
      if (effective) {
        updateAccessibility({
          fontSizeRem: effective.fontSizeRem ?? 1.0,
          highContrastMode: effective.highContrastMode ?? false,
          darkModeOverride: effective.darkModeOverride ?? null,
        })
      }
      return
    }

    let cancelled = false
    fetch(`${API}/api/children/${childId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        updateAccessibility({
          fontSizeRem: data.fontSizeRem ?? 1.0,
          highContrastMode: data.highContrastMode ?? false,
          darkModeOverride: data.darkModeOverride ?? null,
        })
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [childId, isDemo, updateAccessibility])

  return null
}

function ChildModeEntryButton() {
  const match = useMatch('/dashboard/child/:childId/*')
  const onSettingsPage = useMatch('/dashboard/child/:childId/settings')
  const { isChildMode, activeChild, enterChildMode } = useScan()

  // Don't offer to hand the device to the child mid-configuration.
  if (!match || isChildMode || onSettingsPage) return null

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
      <AccessibilitySync />
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
        <Route path="/dashboard/child/:childId/stories/video/:videoId"           element={<RequireAuth><VideoReader /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/storytime"                        element={<RequireAuth><StorytimeNarrator /></RequireAuth>} />

        {/* Learn hub + modules */}
        <Route path="/dashboard/child/:childId/learn"            element={<RequireAuth><Learn /></RequireAuth>} />
        <Route path="/dashboard/child/:childId/learn/:moduleId"  element={<RequireAuth><LearnModule /></RequireAuth>} />

        {/* Communication board */}
        <Route path="/dashboard/child/:childId/communicate" element={<RequireAuth><Communicate /></RequireAuth>} />

        {/* Sound Boards */}
        <Route path="/dashboard/child/:childId/sound-boards" element={<RequireAuth><SoundBoards /></RequireAuth>} />

        {/* Settings */}
        <Route path="/dashboard/child/:childId/settings" element={<RequireAuth><Settings /></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
