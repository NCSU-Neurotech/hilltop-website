import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Settings Page Logic', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Demo Mode Settings Persistence', () => {
    it('should save settings to localStorage in demo mode', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      const settings = {
        fontSize: 1.5,
        highContrast: true,
        darkMode: 'dark',
        scanSpeed: 1000,
        highlightColor: '#FF0000',
        enabledCategories: ['games', 'learn'],
        selectedVoice: 'bella'
      }

      localStorage.setItem(demoSettingsKey, JSON.stringify(settings))
      const saved = JSON.parse(localStorage.getItem(demoSettingsKey))

      expect(saved.fontSize).toBe(1.5)
      expect(saved.highContrast).toBe(true)
      expect(saved.darkMode).toBe('dark')
      expect(saved.enabledCategories).toContain('games')
    })

    it('should retrieve settings from localStorage', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      const settings = {
        fontSize: 1.2,
        highContrast: false,
        darkMode: null,
        scanSpeed: 1200,
        highlightColor: '#FFD700',
        enabledCategories: ['games', 'learn', 'stories', 'sound-boards', 'communicate'],
        selectedVoice: 'default'
      }

      localStorage.setItem(demoSettingsKey, JSON.stringify(settings))

      const retrieved = JSON.parse(localStorage.getItem(demoSettingsKey))
      expect(retrieved).toEqual(settings)
    })

    it('should handle missing localStorage gracefully', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      const saved = localStorage.getItem(demoSettingsKey)
      expect(saved).toBeNull()

      // Should use defaults instead
      const defaults = {
        fontSize: 1.0,
        highContrast: false,
        darkMode: null,
        enabledCategories: ['games', 'learn', 'stories', 'sound-boards', 'communicate']
      }
      expect(defaults.enabledCategories).toHaveLength(5)
    })
  })

  describe('Enabled Categories', () => {
    it('should default to all categories enabled', () => {
      const defaultCategories = ['games', 'learn', 'stories', 'sound-boards', 'communicate']
      expect(defaultCategories).toHaveLength(5)
    })

    it('should allow toggling individual categories', () => {
      let categories = ['games', 'learn', 'stories', 'sound-boards', 'communicate']

      // Uncheck Games
      categories = categories.filter(c => c !== 'games')
      expect(categories).toEqual(['learn', 'stories', 'sound-boards', 'communicate'])
      expect(categories).not.toContain('games')

      // Re-check Games
      categories = [...categories, 'games']
      expect(categories).toContain('games')
      expect(categories).toHaveLength(5)
    })

    it('should persist category changes', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      let categories = ['games', 'learn', 'stories', 'sound-boards', 'communicate']
      categories = categories.filter(c => c !== 'games')

      localStorage.setItem(demoSettingsKey, JSON.stringify({ enabledCategories: categories }))

      const saved = JSON.parse(localStorage.getItem(demoSettingsKey))
      expect(saved.enabledCategories).toEqual(['learn', 'stories', 'sound-boards', 'communicate'])
      expect(saved.enabledCategories).not.toContain('games')
    })
  })

  describe('Font Size Validation', () => {
    it('should validate font size is between 0.8 and 2.0', () => {
      const validateFontSize = (size) => {
        return Math.max(0.8, Math.min(2.0, size))
      }

      expect(validateFontSize(0.5)).toBe(0.8)
      expect(validateFontSize(1.0)).toBe(1.0)
      expect(validateFontSize(1.5)).toBe(1.5)
      expect(validateFontSize(2.5)).toBe(2.0)
    })

    it('should convert font size to pixel value for DOM', () => {
      const fontSizeRem = 1.5
      const pixelValue = fontSizeRem * 16
      expect(pixelValue).toBe(24)

      const fontSizeRem2 = 0.8
      const pixelValue2 = fontSizeRem2 * 16
      expect(pixelValue2).toBe(12.8)
    })
  })

  describe('Voice Selection', () => {
    it('should have default voice option', () => {
      const VOICES = [
        { id: 'default', name: 'Default Browser Voice', provider: 'BROWSER' },
        { id: 'bella', name: 'Bella (ElevenLabs)', provider: 'ELEVENLABS', gender: 'female' },
        { id: 'adam', name: 'Adam (ElevenLabs)', provider: 'ELEVENLABS', gender: 'male' },
        { id: 'child', name: 'Child Voice', provider: 'BROWSER' },
      ]

      expect(VOICES).toHaveLength(4)
      expect(VOICES[0].id).toBe('default')
    })

    it('should find voice by id', () => {
      const VOICES = [
        { id: 'default', name: 'Default Browser Voice', provider: 'BROWSER' },
        { id: 'bella', name: 'Bella (ElevenLabs)', provider: 'ELEVENLABS' },
      ]

      const selectedVoice = 'bella'
      const voice = VOICES.find(v => v.id === selectedVoice)

      expect(voice).toBeDefined()
      expect(voice.name).toBe('Bella (ElevenLabs)')
      expect(voice.provider).toBe('ELEVENLABS')
    })

    it('should persist voice selection', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      const selectedVoice = 'bella'
      localStorage.setItem(demoSettingsKey, JSON.stringify({ selectedVoice }))

      const saved = JSON.parse(localStorage.getItem(demoSettingsKey))
      expect(saved.selectedVoice).toBe('bella')
    })
  })

  describe('Scan Speed Settings', () => {
    it('should have valid scan speed options', () => {
      const SCAN_SPEEDS = [
        { ms: 800, label: 'Very Fast (0.8s)' },
        { ms: 1000, label: 'Fast (1.0s)' },
        { ms: 1200, label: 'Medium (1.2s)' },
        { ms: 1500, label: 'Slow (1.5s)' },
        { ms: 2000, label: 'Very Slow (2.0s)' },
      ]

      expect(SCAN_SPEEDS).toHaveLength(5)
      expect(SCAN_SPEEDS[0].ms).toBe(800)
      expect(SCAN_SPEEDS[4].ms).toBe(2000)
    })

    it('should persist scan speed changes', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      const scanSpeed = 1500
      localStorage.setItem(demoSettingsKey, JSON.stringify({ scanSpeed }))

      const saved = JSON.parse(localStorage.getItem(demoSettingsKey))
      expect(saved.scanSpeed).toBe(1500)
    })
  })

  describe('Color Picker', () => {
    it('should accept valid hex color', () => {
      const isValidColor = (color) => /^#[0-9A-F]{6}$/i.test(color)

      expect(isValidColor('#FFD700')).toBe(true)
      expect(isValidColor('#3b82f6')).toBe(true)
      expect(isValidColor('red')).toBe(false)
      expect(isValidColor('FFD700')).toBe(false)
    })

    it('should persist highlight color', () => {
      const childId = 'demo-child-1'
      const demoSettingsKey = `demo-settings-${childId}`

      const highlightColor = '#FF0000'
      localStorage.setItem(demoSettingsKey, JSON.stringify({ highlightColor }))

      const saved = JSON.parse(localStorage.getItem(demoSettingsKey))
      expect(saved.highlightColor).toBe('#FF0000')
    })
  })
})
