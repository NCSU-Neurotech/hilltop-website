// Demo mode data — used when no backend is available
export const DEMO_FACILITY = {
  id:    'demo',
  name:  'Demo Facility',
  email: 'demo@assistivegames.xyz',
}

export const DEMO_CHILDREN = [
  {
    id:                    'demo-child-1',
    firstName:             'Alex',
    age:                   9,
    avatarId:              'bear',
    scanHighlightColor:    '#3b82f6',
    scanSpeedMs:           1200,
    voiceRate:             0.85,
    voicePitch:            1.0,
    preferredCategories:   [],
    notes:                 '',
    // New accessibility fields
    fontSizeRem:           1.0,
    highContrastMode:      false,
    darkModeOverride:      null,
    // New activity management
    enabledCategories:     ['games', 'learn', 'stories', 'sound-boards', 'communicate'],
    enabledLearnTiers:     ['beginner', 'intermediate', 'advanced'],
    // TTS preference
    ttsPreferenceId:       null,
    ttsPreference:         { id: 'default', provider: 'BROWSER', voiceId: 'default', voiceName: 'Default Browser Voice' },
  },
  {
    id:                    'demo-child-2',
    firstName:             'Jamie',
    age:                   11,
    avatarId:              'fox',
    scanHighlightColor:    '#22c55e',
    scanSpeedMs:           1000,
    voiceRate:             0.85,
    voicePitch:            1.0,
    preferredCategories:   [],
    notes:                 '',
    fontSizeRem:           1.0,
    highContrastMode:      false,
    darkModeOverride:      null,
    enabledCategories:     ['games', 'learn', 'stories', 'sound-boards', 'communicate'],
    enabledLearnTiers:     ['beginner', 'intermediate', 'advanced'],
    ttsPreferenceId:       null,
    ttsPreference:         { id: 'default', provider: 'BROWSER', voiceId: 'default', voiceName: 'Default Browser Voice' },
  },
  {
    id:                    'demo-child-3',
    firstName:             'Sam',
    age:                   7,
    avatarId:              'penguin',
    scanHighlightColor:    '#a855f7',
    scanSpeedMs:           1500,
    voiceRate:             0.85,
    voicePitch:            1.0,
    preferredCategories:   [],
    notes:                 '',
    fontSizeRem:           1.0,
    highContrastMode:      false,
    darkModeOverride:      null,
    enabledCategories:     ['games', 'learn', 'stories', 'sound-boards', 'communicate'],
    enabledLearnTiers:     ['beginner', 'intermediate', 'advanced'],
    ttsPreferenceId:       null,
    ttsPreference:         { id: 'default', provider: 'BROWSER', voiceId: 'default', voiceName: 'Default Browser Voice' },
  },
]

/**
 * Returns a demo child merged with any settings a caregiver has saved for
 * them (Settings.jsx writes these to `demo-settings-<childId>` using the
 * same field names as the child object itself, so this is a plain overlay).
 * Every demo-mode reader (ChildHub, Settings, accessibility sync) should go
 * through this instead of reading DEMO_CHILDREN directly, so a saved change
 * is never visible in one place but not another.
 */
export function getEffectiveDemoChild(childId) {
  const base = DEMO_CHILDREN.find((c) => c.id === childId)
  if (!base) return null

  try {
    const saved = JSON.parse(localStorage.getItem(`demo-settings-${childId}`))
    if (saved && typeof saved === 'object') {
      return { ...base, ...saved }
    }
  } catch {
    // Corrupt/old-format localStorage value — ignore and fall back to base
  }

  return base
}
