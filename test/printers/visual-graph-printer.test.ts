import { describe, it, expect, beforeEach } from 'vitest'
import { Node } from '../../src/node'
import { MockComponentRegistry } from '../test-utils'
import { VisualGraphPrinter } from '../../src/printers/visual-graph-printer'

describe('#createGraphElement', () => {
  const root = new Node('pages/index.vue')

  describe('when the root has no edges', () => {
    const registry = new MockComponentRegistry({
      'pages/index.vue': 'pages/index.vue'
    })
    const printer = new VisualGraphPrinter(registry)

    it('should return an empty array', () => {
      const elements = printer.createGraphElement(root)

      expect(elements).toStrictEqual([{ data: { id: 'pages/index.vue' } }])
    })
  })

  describe('when the root has one edge', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const printer = new VisualGraphPrinter(registry)
    beforeEach(() => {
      root.addEdges({
        App: new Node('App')
      })
    })

    it('should return an array with two elements', () => {
      const elements = printer.createGraphElement(root)

      const indexVue = elements.find(e => e.data.id === 'pages/index.vue')
      const appVue = elements.find(e => e.data.id === 'components/App.vue')
      const edge = elements.find(e => e.data.id === 'pages/index.vue-components/App.vue')
      expect(indexVue).toBeDefined()
      expect(appVue).toBeDefined()
      expect(edge).toBeDefined()
    })
  })

  describe('when the root has nested edges', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'Button': 'components/atoms/Button.vue',
      'InputText': 'components/atoms/InputText.vue',
      'Header': 'components/Header.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const printer = new VisualGraphPrinter(registry)
    beforeEach(() => {
      root.addEdges({
        App: new Node('App', {
          Button: new Node('Button'),
          InputText: new Node('InputText')
        }),
        Header: new Node('Header')
      })
    })

    it('should return an array with nodes and edges', () => {
      const elements = printer.createGraphElement(root)

      const indexVue = elements.find(e => e.data.id === 'pages/index.vue')
      const appVue = elements.find(e => e.data.id === 'components/App.vue')
      const buttonVue = elements.find(e => e.data.id === 'components/atoms/Button.vue')
      const inputTextVue = elements.find(e => e.data.id === 'components/atoms/InputText.vue')
      const headerVue = elements.find(e => e.data.id === 'components/Header.vue')
      const edge1 = elements.find(e => e.data.id === 'pages/index.vue-components/App.vue')
      const edge2 = elements.find(e => e.data.id === 'components/App.vue-components/atoms/Button.vue')
      const edge3 = elements.find(e => e.data.id === 'components/App.vue-components/atoms/InputText.vue')
      const edge4 = elements.find(e => e.data.id === 'pages/index.vue-components/Header.vue')
      expect(indexVue).toBeDefined()
      expect(appVue).toBeDefined()
      expect(buttonVue).toBeDefined()
      expect(inputTextVue).toBeDefined()
      expect(headerVue).toBeDefined()
      expect(edge1).toBeDefined()
      expect(edge2).toBeDefined()
      expect(edge3).toBeDefined()
      expect(edge4).toBeDefined()
    })
  })

  describe('when the several nodes shares some edges', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'Button': 'components/atoms/Button.vue',
      'InputText': 'components/atoms/InputText.vue',
      'Header': 'components/Header.vue',
      'Message': 'components/Message.vue',
      'pages/index.vue': 'pages/index.vue',
      'pages/about.vue': 'pages/about.vue'
    })
    const printer = new VisualGraphPrinter(registry)
    const about = new Node('pages/about.vue')
    beforeEach(() => {
      root.addEdges({
        App: new Node('App', {
          Button: new Node('Button'),
          InputText: new Node('InputText')
        }),
        Header: new Node('Header'),
        Message: new Node('Message')
      })
      about.addEdges({
        App: new Node('App', {
          Button: new Node('Button'),
          InputText: new Node('InputText')
        }),
        Message: new Node('Message')
      })
    })

    it('should return an array with nodes and edges', () => {
      const elements = printer.createGraphElement(root).concat(printer.createGraphElement(about))

      const indexVue = elements.find(e => e.data.id === 'pages/index.vue')
      const aboutVue = elements.find(e => e.data.id === 'pages/about.vue')
      const appVue = elements.find(e => e.data.id === 'components/App.vue')
      const buttonVue = elements.find(e => e.data.id === 'components/atoms/Button.vue')
      const inputTextVue = elements.find(e => e.data.id === 'components/atoms/InputText.vue')
      const headerVue = elements.find(e => e.data.id === 'components/Header.vue')
      const messageVue = elements.find(e => e.data.id === 'components/Message.vue')
      const edge1 = elements.find(e => e.data.id === 'pages/index.vue-components/App.vue')
      const edge2 = elements.find(e => e.data.id === 'components/App.vue-components/atoms/Button.vue')
      const edge3 = elements.find(e => e.data.id === 'components/App.vue-components/atoms/InputText.vue')
      const edge4 = elements.find(e => e.data.id === 'pages/index.vue-components/Header.vue')
      const edge5 = elements.find(e => e.data.id === 'pages/index.vue-components/Message.vue')
      const edge6 = elements.find(e => e.data.id === 'pages/about.vue-components/App.vue')
      const edge7 = elements.find(e => e.data.id === 'pages/about.vue-components/Message.vue')
      expect(indexVue).toBeDefined()
      expect(aboutVue).toBeDefined()
      expect(appVue).toBeDefined()
      expect(buttonVue).toBeDefined()
      expect(inputTextVue).toBeDefined()
      expect(headerVue).toBeDefined()
      expect(messageVue).toBeDefined()
      expect(edge1).toBeDefined()
      expect(edge2).toBeDefined()
      expect(edge3).toBeDefined()
      expect(edge4).toBeDefined()
      expect(edge5).toBeDefined()
      expect(edge6).toBeDefined()
      expect(edge7).toBeDefined()
    })
  })
})
