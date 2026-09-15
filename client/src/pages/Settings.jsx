/**
 * Settings — /dashboard/child/:childId/settings
 *
 * Comprehensive settings page:
 * - Accessibility (font size, high contrast, dark mode)
 * - Scanner (scan speed, highlight color)
 * - Module Management (enable/disable categories)
 *
 * There's no voice selection here — ElevenLabs is the only voice, and
 * useSpeech falls back to the browser's Web Speech API silently if
 * ElevenLabs isn't available. Never surfaced as a user-facing choice.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAccessibility } from '../context/AccessibilityContext'
import { useScan } from '../context/ScanContext'
import { useAuth } from '../context/AuthContext'
import { getEffectiveDemoChild } from '../demo/demoData'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const SCAN_SPEEDS = [
  { ms: 800, label: 'Very Fast (0.8s)' },
  { ms: 1000, label: 'Fast (1.0s)' },
  { ms: 1200, label: 'Medium (1.2s)' },
  { ms: 1500, label: 'Slow (1.5s)' },
  { ms: 2000, label: 'Very Slow (2.0s)' },
]

const CATEGORIES = [
  { id: 'games', label: 'Games', emoji: '🎮' },
  { id: 'learn', label: 'Learn', emoji: '📚' },
  { id: 'stories', label: 'Stories', emoji: '📖' },
  { id: 'sound-boards', label: 'Sound Boards', emoji: '🔊' },
  { id: 'communicate', label: 'Communicate', emoji: '💬' },
]

const LEARN_TIERS = [
  { id: 'beginner', label: 'Beginner', desc: 'Ages 3–7' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Ages 8–12' },
  { id: 'advanced', label: 'Advanced', desc: 'Ages 13–17' },
]

export default function Settings() {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { fontSizeRem, highContrastMode, darkModeOverride, updateAccessibility } = useAccessibility()
  const { scanProfile, updateChild } = useScan()
  const { isDemo } = useAuth()

  const [child, setChild] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [fontSize, setFontSize] = useState(1.0)
  const [highContrast, setHighContrast] = useState(false)
  const [darkMode, setDarkMode] = useState(null)
  const [scanSpeed, setScanSpeed] = useState(1200)
  const [highlightColor, setHighlightColor] = useState('#FFD700')
  const [enabledCategories, setEnabledCategories] = useState(['games', 'learn', 'stories', 'sound-boards', 'communicate'])
  const [enabledLearnTiers, setEnabledLearnTiers] = useState(['beginner', 'intermediate', 'advanced'])

  // Fetch child profile
  useEffect(() => {
    setLoading(true)

    if (isDemo) {
      const effective = getEffectiveDemoChild(childId)
      if (!effective) {
        navigate('/dashboard', { replace: true })
        return
      }
      setChild(effective)
      setFontSize(effective.fontSizeRem ?? 1.0)
      setHighContrast(effective.highContrastMode ?? false)
      setDarkMode(effective.darkModeOverride ?? null)
      setScanSpeed(effective.scanSpeedMs ?? 1200)
      setHighlightColor(effective.scanHighlightColor ?? '#FFD700')
      setEnabledCategories(effective.enabledCategories ?? ['games', 'learn', 'stories', 'sound-boards', 'communicate'])
      setEnabledLearnTiers(effective.enabledLearnTiers ?? ['beginner', 'intermediate', 'advanced'])
      setLoading(false)
      return
    }

    fetch(`${API}/api/children/${childId}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          navigate('/dashboard', { replace: true })
          return
        }
        setChild(data)
        setFontSize(data.fontSizeRem || 1.0)
        setHighContrast(data.highContrastMode || false)
        setDarkMode(data.darkModeOverride || null)
        setScanSpeed(data.scanSpeedMs || 1200)
        setHighlightColor(data.scanHighlightColor || '#FFD700')
        setEnabledCategories(data.enabledCategories || ['games', 'learn', 'stories', 'sound-boards', 'communicate'])
        setEnabledLearnTiers(data.enabledLearnTiers || ['beginner', 'intermediate', 'advanced'])
      })
      .catch(() => navigate('/dashboard', { replace: true }))
      .finally(() => setLoading(false))
  }, [childId, isDemo])

  const handleCategoryToggle = (categoryId) => {
    setEnabledCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    )
  }

  const handleLearnTierToggle = (tierId) => {
    setEnabledLearnTiers((prev) =>
      prev.includes(tierId) ? prev.filter((t) => t !== tierId) : [...prev, tierId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      // In demo mode, save to localStorage using the same field names as the
      // real child object so every demo-mode reader (ChildHub, accessibility
      // sync) can merge it in identically via getEffectiveDemoChild().
      if (isDemo) {
        const demoSettingsKey = `demo-settings-${childId}`
        localStorage.setItem(
          demoSettingsKey,
          JSON.stringify({
            fontSizeRem: fontSize,
            highContrastMode: highContrast,
            darkModeOverride: darkMode,
            scanSpeedMs: scanSpeed,
            scanHighlightColor: highlightColor,
            enabledCategories,
            enabledLearnTiers,
          })
        )
      } else {
        // Update child profile (real backend)
        const childRes = await fetch(`${API}/api/children/${childId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fontSizeRem: fontSize,
            highContrastMode: highContrast,
            darkModeOverride: darkMode,
            scanSpeedMs: scanSpeed,
            scanHighlightColor: highlightColor,
            enabledCategories,
            enabledLearnTiers,
          }),
        })

        if (!childRes.ok) throw new Error('Failed to update child')
      }

      // Update contexts
      updateAccessibility({ fontSizeRem: fontSize, highContrastMode: highContrast, darkModeOverride: darkMode })
      updateChild({
        ...child,
        fontSizeRem: fontSize,
        highContrastMode: highContrast,
        darkModeOverride: darkMode,
        scanSpeedMs: scanSpeed,
        scanHighlightColor: highlightColor,
        enabledCategories,
        enabledLearnTiers,
      })

      setMessage('✓ Settings saved successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('✗ Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <header className="bg-[#1e293b] border-b border-slate-700/60 px-6 py-4 flex items-center gap-4">
        <Link
          to={`/dashboard/child/${childId}`}
          className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-lg font-black text-white">⚙️ Settings</h1>
          <p className="text-slate-400 text-xs mt-0.5">{child?.firstName}'s preferences</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Message */}
        {message && (
          <div
            className={`px-4 py-3 rounded-xl text-sm font-semibold ${
              message.startsWith('✓') ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {/* Accessibility Section */}
        <section className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/60 space-y-5">
          <h2 className="text-white font-black text-lg">🎨 Accessibility</h2>

          {/* Font Size */}
          <div>
            <label className="block text-white font-semibold text-sm mb-3">
              Text Size: {(fontSize * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.8"
              max="2"
              step="0.1"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-slate-400 text-xs mt-2">Adjust text size (80% — 200%)</p>
          </div>

          {/* High Contrast */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <input
              type="checkbox"
              id="high-contrast"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer"
            />
            <label htmlFor="high-contrast" className="flex-1 text-white font-semibold cursor-pointer">
              High Contrast Mode
            </label>
            <span className="text-slate-400 text-xs">🎯</span>
          </div>

          {/* Dark Mode */}
          <div>
            <label className="block text-white font-semibold text-sm mb-2">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'dark', label: '🌙 Dark' },
                { value: 'light', label: '☀️ Light' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDarkMode(option.value)}
                  className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    // A child with no explicit choice saved yet (darkMode === null)
                    // shows as Dark, since that's the app's native default look.
                    (darkMode ?? 'dark') === option.value
                      ? 'bg-[#FFD700] text-[#0f172a]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Scanner Settings Section */}
        <section className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/60 space-y-5">
          <h2 className="text-white font-black text-lg">⚡ Scanner Settings</h2>

          {/* Scan Speed */}
          <div>
            <label className="block text-white font-semibold text-sm mb-3">Scan Speed</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SCAN_SPEEDS.map((speed) => (
                <button
                  key={speed.ms}
                  onClick={() => setScanSpeed(speed.ms)}
                  className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    scanSpeed === speed.ms
                      ? 'bg-[#FFD700] text-[#0f172a]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>

          {/* Highlight Color */}
          <div>
            <label className="block text-white font-semibold text-sm mb-3">Highlight Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="w-16 h-16 rounded-lg cursor-pointer border-2 border-slate-600"
              />
              <div className="flex-1">
                <p className="text-white text-sm">Current: {highlightColor}</p>
                <p className="text-slate-400 text-xs">Pick a color for scan highlighting</p>
              </div>
            </div>
          </div>
        </section>

        {/* Module Management Section */}
        <section className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/60 space-y-5">
          <h2 className="text-white font-black text-lg">📚 Available Activities</h2>
          <p className="text-slate-400 text-sm">
            Check activities this child can meaningfully engage with:
          </p>

          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={enabledCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-white font-semibold">{cat.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Learn Tiers Section */}
        <section className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/60 space-y-5">
          <h2 className="text-white font-black text-lg">🎓 Learn Content Tiers</h2>
          <p className="text-slate-400 text-sm">
            Choose which difficulty tiers appear in this child's Learn hub:
          </p>

          <div className="space-y-3">
            {LEARN_TIERS.map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={enabledLearnTiers.includes(t.id)}
                  onChange={() => handleLearnTierToggle(t.id)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
                <span className="text-white font-semibold">{t.label}</span>
                <span className="text-slate-500 text-xs">{t.desc}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex gap-3 justify-center pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 h-12 rounded-xl bg-[#FFD700] text-[#0f172a] font-black text-base
                       hover:bg-yellow-300 disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : '💾 Save Settings'}
          </button>
          <button
            onClick={() => navigate(`/dashboard/child/${childId}`)}
            className="px-8 h-12 rounded-xl bg-slate-700 text-slate-300 font-semibold text-base
                       hover:bg-slate-600 transition-all"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-700 border-t-[#FFD700] rounded-full animate-spin" />
    </div>
  )
}
