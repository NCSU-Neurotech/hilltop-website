import { describe, it, expect, beforeEach } from 'vitest'
import { DEMO_FACILITY, DEMO_CHILDREN, getEffectiveDemoChild } from './demoData'

describe('Demo Data Validation', () => {
  describe('DEMO_FACILITY', () => {
    it('should have required facility fields', () => {
      expect(DEMO_FACILITY.id).toBe('demo')
      expect(DEMO_FACILITY.name).toBe('Demo Facility')
      expect(DEMO_FACILITY.email).toBeDefined()
    })

    it('should have valid structure', () => {
      expect(DEMO_FACILITY).toHaveProperty('id')
      expect(DEMO_FACILITY).toHaveProperty('name')
      expect(DEMO_FACILITY).toHaveProperty('email')
    })
  })

  describe('DEMO_CHILDREN', () => {
    it('should have 3 demo children', () => {
      expect(DEMO_CHILDREN).toHaveLength(3)
    })

    it('should have valid child IDs', () => {
      const ids = DEMO_CHILDREN.map(c => c.id)
      expect(ids).toContain('demo-child-1')
      expect(ids).toContain('demo-child-2')
      expect(ids).toContain('demo-child-3')
    })

    it('should have required child fields', () => {
      DEMO_CHILDREN.forEach(child => {
        expect(child).toHaveProperty('id')
        expect(child).toHaveProperty('firstName')
        expect(child).toHaveProperty('age')
        expect(child).toHaveProperty('avatarId')
      })
    })

    it('should have new accessibility fields', () => {
      DEMO_CHILDREN.forEach(child => {
        expect(child).toHaveProperty('fontSizeRem')
        expect(child).toHaveProperty('highContrastMode')
        expect(child).toHaveProperty('darkModeOverride')
        expect(child).toHaveProperty('enabledCategories')
        expect(child).toHaveProperty('ttsPreference')
      })
    })

    it('should have valid default values for accessibility', () => {
      DEMO_CHILDREN.forEach(child => {
        expect(child.fontSizeRem).toBe(1.0)
        expect(child.highContrastMode).toBe(false)
        expect(child.darkModeOverride).toBeNull()
        expect(Array.isArray(child.enabledCategories)).toBe(true)
        expect(child.ttsPreference).toBeDefined()
      })
    })

    it('should have all 5 categories enabled by default', () => {
      DEMO_CHILDREN.forEach(child => {
        expect(child.enabledCategories).toContain('games')
        expect(child.enabledCategories).toContain('learn')
        expect(child.enabledCategories).toContain('stories')
        expect(child.enabledCategories).toContain('sound-boards')
        expect(child.enabledCategories).toContain('communicate')
        expect(child.enabledCategories).toHaveLength(5)
      })
    })

    it('should have valid TTS preference', () => {
      DEMO_CHILDREN.forEach(child => {
        expect(child.ttsPreference).toHaveProperty('id')
        expect(child.ttsPreference).toHaveProperty('provider')
        expect(child.ttsPreference).toHaveProperty('voiceId')
        expect(child.ttsPreference).toHaveProperty('voiceName')
      })
    })

    it('should have scanner settings', () => {
      DEMO_CHILDREN.forEach(child => {
        expect(child).toHaveProperty('scanSpeedMs')
        expect(child).toHaveProperty('scanHighlightColor')
        expect(typeof child.scanSpeedMs).toBe('number')
        expect(child.scanSpeedMs).toBeGreaterThanOrEqual(800)
        expect(child.scanSpeedMs).toBeLessThanOrEqual(2000)
      })
    })

    it('should have unique highlight colors', () => {
      const colors = DEMO_CHILDREN.map(c => c.scanHighlightColor)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(3)
    })
  })

  describe('Demo Child - Alex', () => {
    const alex = DEMO_CHILDREN[0]

    it('should be demo-child-1', () => {
      expect(alex.id).toBe('demo-child-1')
    })

    it('should have name Alex', () => {
      expect(alex.firstName).toBe('Alex')
    })

    it('should have bear avatar', () => {
      expect(alex.avatarId).toBe('bear')
    })

    it('should have all required fields', () => {
      expect(alex.id).toBeDefined()
      expect(alex.firstName).toBeDefined()
      expect(alex.age).toBeDefined()
      expect(alex.avatarId).toBeDefined()
      expect(alex.scanHighlightColor).toBeDefined()
      expect(alex.scanSpeedMs).toBeDefined()
      expect(alex.enabledCategories).toBeDefined()
      expect(alex.fontSizeRem).toBeDefined()
      expect(alex.ttsPreference).toBeDefined()
    })
  })

  describe('Demo Child - Jamie', () => {
    const jamie = DEMO_CHILDREN[1]

    it('should be demo-child-2', () => {
      expect(jamie.id).toBe('demo-child-2')
    })

    it('should have name Jamie', () => {
      expect(jamie.firstName).toBe('Jamie')
    })

    it('should have fox avatar', () => {
      expect(jamie.avatarId).toBe('fox')
    })
  })

  describe('Demo Child - Sam', () => {
    const sam = DEMO_CHILDREN[2]

    it('should be demo-child-3', () => {
      expect(sam.id).toBe('demo-child-3')
    })

    it('should have name Sam', () => {
      expect(sam.firstName).toBe('Sam')
    })

    it('should have penguin avatar', () => {
      expect(sam.avatarId).toBe('penguin')
    })
  })

  describe('getEffectiveDemoChild', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('returns the base child unchanged when no settings have been saved', () => {
      const effective = getEffectiveDemoChild('demo-child-1')
      expect(effective.firstName).toBe('Alex')
      expect(effective.scanHighlightColor).toBe('#3b82f6')
    })

    it('returns null for an unknown child id', () => {
      expect(getEffectiveDemoChild('not-a-real-child')).toBeNull()
    })

    // Regression test: Settings.jsx used to show "Demo Child" instead of the
    // real name, and a saved highlight color / enabled-categories change
    // never showed up on the dashboard because it read DEMO_CHILDREN
    // directly instead of merging in the localStorage override.
    it('overlays saved settings on top of the base child without losing identity fields', () => {
      localStorage.setItem(
        'demo-settings-demo-child-1',
        JSON.stringify({
          scanHighlightColor: '#ff00ff',
          enabledCategories: ['games'],
          fontSizeRem: 1.4,
        })
      )

      const effective = getEffectiveDemoChild('demo-child-1')
      expect(effective.firstName).toBe('Alex') // identity preserved
      expect(effective.scanHighlightColor).toBe('#ff00ff') // override applied
      expect(effective.enabledCategories).toEqual(['games'])
      expect(effective.fontSizeRem).toBe(1.4)
    })

    it('falls back to the base child if localStorage has corrupt JSON', () => {
      localStorage.setItem('demo-settings-demo-child-2', 'not valid json{')
      const effective = getEffectiveDemoChild('demo-child-2')
      expect(effective.firstName).toBe('Jamie')
    })
  })
})
