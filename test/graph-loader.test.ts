import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import mockFs from 'mock-fs'
import { GraphLoader } from '../src/graph-loader'
import { Node } from '../src/node'
import { MockComponentRegistry } from './test-utils'

afterEach(() => {
  mockFs.restore()
})

describe('GraphLoader', () => {
  describe('when the node name does not map to any element', () => {
    const registry = new MockComponentRegistry({})
    const loader = new GraphLoader(registry)
    beforeEach(() => {
      mockFs({})
    })

    it('should load no edges', () => {
      const root = new Node('pages/index.vue')
      loader.load(root)

      expect(root.edges).toStrictEqual({})
    })
  })

  describe('when a root node uses no components', () => {
    const registry = new MockComponentRegistry({
      'pages/index.vue': 'pages/index.vue'
    })
    const loader = new GraphLoader(registry)
    beforeEach(() => {
      mockFs({
        'pages': {
          'index.vue': '<template></template>'
        }
      })
    })

    it('should load no edges', () => {
      const root = new Node('pages/index.vue')
      loader.load(root)
    })
  })

  describe('when a root uses a component', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const loader = new GraphLoader(registry)
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': '<template></template>'
        },
        'pages': {
          'index.vue': '<template><App /></template>'
        }
      })
    })

    it('should load a edge', () => {
      const root = new Node('pages/index.vue')
      loader.load(root)

      expect(root.edges.App).toBeDefined()
      expect(root.edges.App.edges).toStrictEqual({})
    })
  })
})
