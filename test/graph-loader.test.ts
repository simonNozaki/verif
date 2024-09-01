import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import mockFs from 'mock-fs'
import { GraphLoader } from '../src/graph-loader'
import { Node } from '../src/node'
import { MockComponentRegistry } from './test-utils'

afterEach(() => {
  mockFs.restore()
})

describe('GraphLoader#load', () => {
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

      expect(root.edges).toStrictEqual({})
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

  describe('when a root node uses nested components', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'Button': 'components/atoms/Button.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const loader = new GraphLoader(registry)
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': '<template><Button>save</Button></template>',
          'atoms': {
            'Button.vue': '<template><button type="button"><slot /></button></template>'
          }
        },
        'pages': {
          'index.vue': '<template><App /></template>'
        }
      })
    })

    it('should load nested edges', () => {
      const root = new Node('pages/index.vue')
      loader.load(root)

      expect(root.edges.App).toBeDefined()
      expect(root.edges.App.edges.Button).toBeDefined()
      expect(root.edges.App.edges.Button.edges).toStrictEqual({})
    })
  })

  describe('when a component has v-if condition', () => {
    const registry = new MockComponentRegistry({
      'Button': 'components/atoms/Button.vue',
      'App': 'components/App.vue',
      'AddButton': 'components/AddButton.vue',
      'DeleteButton': 'components/DeleteButton.vue',
      'UpdateButton': 'components/UpdateButton.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    const loader = new GraphLoader(registry)
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': `
<template>
  <section>
    <AddButton v-if="showAddButton" />
    <UpdateButton v-else-if="showUpdateButton" />
    <DeleteButton v-else />
  </section>
</template>`,
          'AddButton.vue': '<template><Button>add</Button></template>',
          'DeleteButton.vue': '<template><Button>delete</Button></template>',
          'UpdateButton.vue': '<template><Button>update</Button></template>',
          'atoms': {
            'Button.vue': '<template><button type="button"><slot /></button></template>'
          }
        },
        'pages': {
          'index.vue': '<template><App /></template>'
        }
      })
    })

    it('should load nested edges', () => {
      const root = new Node('pages/index.vue')
      loader.load(root)

      expect(root.edges.App).toBeDefined()
      expect(root.edges.App.edges.AddButton).toBeDefined()
      expect(root.edges.App.edges.AddButton.edges.Button).toBeDefined()
      expect(root.edges.App.edges.DeleteButton).toBeDefined()
      expect(root.edges.App.edges.DeleteButton.edges.Button).toBeDefined()
      expect(root.edges.App.edges.UpdateButton).toBeDefined()
      expect(root.edges.App.edges.UpdateButton.edges.Button).toBeDefined()
    })
  })
})

describe('GraphLoader#searchFilePath', () => {
  describe('when components name is camel case', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'AddCardButton': 'components/AddCardButton.vue',
      'DeleteCardButton': 'components/DeleteCardButton.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': `
<template>
  <section>
    <p>Add card</p>
    <AddCardButton />
    <p>Delete card</p>
    <DeleteCardButton />
  </section>
</template>
`
        },
        'pages': {
          'index.vue': '<template><App /></template>'
        }
      })
    })
    const loader = new GraphLoader(registry)

    it('should match in the registry', () => {
      const addCardButton = loader.searchFilePath('AddCardButton')
      const deleteCardButton = loader.searchFilePath('DeleteCardButton')

      expect(addCardButton).toBe('components/AddCardButton.vue')
      expect(deleteCardButton).toBe('components/DeleteCardButton.vue')
    })
  })

  describe('when components name is kebab case', () => {
    const registry = new MockComponentRegistry({
      'app': 'components/app.vue',
      'add-card-button': 'components/add-card-button.vue',
      'delete-card-button': 'components/delete-card-button.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': `
<template>
  <section>
    <p>Add card</p>
    <add-card-button />
    <p>Delete card</p>
    <delete-card-button />
  </section>
</template>
`
        },
        'pages': {
          'index.vue': '<template><app /></template>'
        }
      })
    })
    const loader = new GraphLoader(registry)

    it('should match in the registry', () => {
      const addCardButton = loader.searchFilePath('add-card-button')
      const deleteCardButton = loader.searchFilePath('delete-card-button')

      expect(addCardButton).toBe('components/add-card-button.vue')
      expect(deleteCardButton).toBe('components/delete-card-button.vue')
    })
  })

  describe('when components name in templates is camel case and files are kebab case', () => {
    const registry = new MockComponentRegistry({
      'app': 'components/app.vue',
      'add-card-button': 'components/add-card-button.vue',
      'delete-card-button': 'components/delete-card-button.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': `
<template>
  <section>
    <p>Add card</p>
    <AddCardButton />
    <p>Delete card</p>
    <DeleteCardButton />
  </section>
</template>
`
        },
        'pages': {
          'index.vue': '<template><App /></template>'
        }
      })
    })
    const loader = new GraphLoader(registry)

    it('should match in the registry', () => {
      // Loader specify node name by names in template
      const app = loader.searchFilePath('App')
      const addCardButton = loader.searchFilePath('AddCardButton')
      const deleteCardButton = loader.searchFilePath('DeleteCardButton')

      expect(app).toBe('components/app.vue')
      expect(addCardButton).toBe('components/add-card-button.vue')
      expect(deleteCardButton).toBe('components/delete-card-button.vue')
    })
  })

  describe('when components name in templates is kebab case and files are camel case', () => {
    const registry = new MockComponentRegistry({
      'App': 'components/App.vue',
      'AddCardButton': 'components/AddCardButton.vue',
      'DeleteCardButton': 'components/DeleteCardButton.vue',
      'pages/index.vue': 'pages/index.vue'
    })
    beforeEach(() => {
      mockFs({
        'components': {
          'App.vue': `
<template>
  <section>
    <p>Add card</p>
    <add-card-button />
    <p>Delete card</p>
    <delete-card-button />
  </section>
</template>
`
        },
        'pages': {
          'index.vue': '<template><app /></template>'
        }
      })
    })
    const loader = new GraphLoader(registry)

    it('should match in the registry', () => {
      // Loader specify node name by names in template
      const app = loader.searchFilePath('app')
      const addCardButton = loader.searchFilePath('add-card-button')
      const deleteCardButton = loader.searchFilePath('delete-card-button')

      expect(app).toBe('components/App.vue')
      expect(addCardButton).toBe('components/AddCardButton.vue')
      expect(deleteCardButton).toBe('components/DeleteCardButton.vue')
    })
  })
})
