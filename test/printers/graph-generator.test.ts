import { describe, it, expect, beforeEach } from 'vitest'
import { Node } from '../../src/node'
import { MockComponentRegistry } from '../test-utils'
import { CytoscapeGraphStrategy, GraphGenerator, ObjectGraphStrategy } from '../../src/printers/graph-generator'

describe('#generate', () => {
  const root = new Node('pages/index.vue')

  describe('when the root has no edges', () => {
    const registry = new MockComponentRegistry({
      'pages/index.vue': 'pages/index.vue'
    })
    const generator = new GraphGenerator<'cytoscape'>(registry, CytoscapeGraphStrategy)

    it('should return an empty array', () => {
      const elements = generator.generate(root)

      expect(elements).toStrictEqual([{ data: { id: 'pages/index.vue' } }])
    })
  })

  describe('when the root has one edge', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const generator = new GraphGenerator<'cytoscape'>(registry, CytoscapeGraphStrategy)
    beforeEach(() => {
      root.addEdges({
        App: new Node('App')
      })
    })

    it('should return an array with two elements', () => {
      const elements = generator.generate(root)

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
    const generator = new GraphGenerator<'cytoscape'>(registry, CytoscapeGraphStrategy)
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
      const elements = generator.generate(root)

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
  describe('when the custom object strategy is selected', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'Button': 'components/atoms/Button.vue',
      'InputText': 'components/atoms/InputText.vue',
      'Header': 'components/Header.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const generator = new GraphGenerator<'object'>(registry, ObjectGraphStrategy)
    beforeEach(() => {
      root.addEdges({
        App: new Node('App', {
          Button: new Node('Button'),
          InputText: new Node('InputText')
        }),
        Header: new Node('Header')
      })
    })

    it('should return general object', () => {
      const elements = generator.generate(root)

      const indexVue = elements.find(e => e.id === 'pages/index.vue')
      const appVue = elements.find(e => e.id === 'components/App.vue')
      const buttonVue = elements.find(e => e.id === 'components/atoms/Button.vue')
      const inputTextVue = elements.find(e => e.id === 'components/atoms/InputText.vue')
      const headerVue = elements.find(e => e.id === 'components/Header.vue')
      const edge1 = elements.find(e => e.id === 'pages/index.vue-components/App.vue')
      const edge2 = elements.find(e => e.id === 'components/App.vue-components/atoms/Button.vue')
      const edge3 = elements.find(e => e.id === 'components/App.vue-components/atoms/InputText.vue')
      const edge4 = elements.find(e => e.id === 'pages/index.vue-components/Header.vue')
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
})

describe('#generateAll', () => {
  const root = new Node('pages/index.vue')

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
    const generator = new GraphGenerator<'cytoscape'>(registry, CytoscapeGraphStrategy)
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

    it('should return nodes and edges resolved each by once', () => {
      const elements = generator.generateAll([about, root])

      const indexVue = elements.find(e => e.data.id === 'pages/index.vue')
      const aboutVue = elements.find(e => e.data.id === 'pages/about.vue')
      const appVue = elements.filter(e => e.data.id === 'components/App.vue')
      const buttonVue = elements.find(e => e.data.id === 'components/atoms/Button.vue')
      const inputTextVue = elements.find(e => e.data.id === 'components/atoms/InputText.vue')
      const headerVue = elements.find(e => e.data.id === 'components/Header.vue')
      const messageVue = elements.find(e => e.data.id === 'components/Message.vue')
      const edge1 = elements.find(e => e.data.id === 'pages/index.vue-components/App.vue')
      const appToButton = elements.filter(e => e.data.id === 'components/App.vue-components/atoms/Button.vue')
      const appToInputText = elements.filter(e => e.data.id === 'components/App.vue-components/atoms/InputText.vue')
      const edge4 = elements.find(e => e.data.id === 'pages/index.vue-components/Header.vue')
      const edge5 = elements.find(e => e.data.id === 'pages/index.vue-components/Message.vue')
      const edge6 = elements.find(e => e.data.id === 'pages/about.vue-components/App.vue')
      const edge7 = elements.find(e => e.data.id === 'pages/about.vue-components/Message.vue')
      expect(indexVue).toBeDefined()
      expect(aboutVue).toBeDefined()
      expect(appVue).toHaveLength(1)
      expect(appVue).toBeDefined()
      expect(buttonVue).toBeDefined()
      expect(inputTextVue).toBeDefined()
      expect(headerVue).toBeDefined()
      expect(messageVue).toBeDefined()
      expect(edge1).toBeDefined()
      expect(appToButton).toHaveLength(1)
      expect(appToInputText).toHaveLength(1)
      expect(edge4).toBeDefined()
      expect(edge5).toBeDefined()
      expect(edge6).toBeDefined()
      expect(edge7).toBeDefined()
    })
  })
})
