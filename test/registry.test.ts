import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import mockFs from 'mock-fs'
import { readDirDeepSync } from '../src/registry'

afterEach(() => {
  mockFs.restore()
})

describe('#readDirDeepSync', () => {
  describe('when directory has no entries', () => {
    beforeEach(() => {
      mockFs({ 'components': {} })
    })

    it('should get empty dictionary', () => {
      const dictionary = readDirDeepSync('components')

      expect(dictionary).toStrictEqual({})
    })
  })

  describe('when directory has some Vue files', () => {
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': '<template></template>',
          'index.vue': '<template></template>',
        }
      })
    })

    it('should return dictionary with props', () => {
      const dictionary = readDirDeepSync('components')

      expect(dictionary).toStrictEqual({
        'App': 'components/App.vue',
        'index': 'components/index.vue'
      })
    })
  })

  describe('when there are nested components', () => {
    beforeEach(() => {
      mockFs({
        'components': {
          'atoms': {
            'Button.vue': '<template></template>',
            'InputText.vue': '<template></template>',
          },
          'App.vue': '<template></template>',
          'index.vue': '<template></template>',
        }
      })
    })

    it('should return dictionary with flatten props', () => {
      const dictionary = readDirDeepSync('components')

      expect(dictionary).toStrictEqual({
        'Button': 'components/atoms/Button.vue',
        'InputText': 'components/atoms/InputText.vue',
        'App': 'components/App.vue',
        'index': 'components/index.vue'
      })
    })
  })

  describe('when a directory has non-Vue files', () => {
    it('should include only Vue.file', () => {})
  })
})
