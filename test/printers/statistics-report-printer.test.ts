import { describe, it, expect } from 'vitest'
import type { GraphElement } from '../../src/printers/graph-generator'
import { createComponentStatistics } from '../../src/printers/statistics-report-printer'

describe('#createComponentStatistics', () => {
  describe('when elements have a single node', () => {
    const elements: GraphElement[] = [{ id: 'App.vue', name: 'App.vue' }]

    it('should be indegree 0', () => {
      const statistics = createComponentStatistics(elements)

      expect(statistics).toHaveLength(0)
    })
  })

  describe('when there is a single edge', () => {
    const elements: GraphElement[] = [
      { id: 'App.vue', name: 'App.vue' },
      { id: 'Button.vue', name: 'Button.vue' },
      { id: 'App.vue-Button.vue', source: 'App.vue', target: 'Button.vue' }
    ]

    it('should be indegree 1', () => {
      const statistics = createComponentStatistics(elements)

      expect(statistics).toHaveLength(1)
      expect(statistics[0]?.name).toBe('Button.vue')
      expect(statistics[0]?.indegree).toBe(1)
    })
  })

  describe('when node is depended by other nodes', () => {
    const elements: GraphElement[] = [
      { id: 'App.vue', name: 'App.vue' },
      { id: 'Button.vue', name: 'Button.vue' },
      { id: 'About.vue', name: 'About.vue' },
      { id: 'App.vue-Button.vue', source: 'App.vue', target: 'Button.vue' },
      { id: 'About.vue-Button.vue', source: 'About.vue', target: 'Button.vue' },
    ]

    it('should be indegree 2', () => {
      const statistics = createComponentStatistics(elements)

      expect(statistics).toHaveLength(1)
      expect(statistics[0]?.name).toBe('Button.vue')
      expect(statistics[0]?.indegree).toBe(2)
    })
  })

  describe('when a node has edge and is depended by other nodes', () => {
    const elements: GraphElement[] = [
      { id: 'App.vue', name: 'App.vue' },
      { id: 'TodoList.vue', name: 'TodoList.vue' },
      { id: 'TodoItem.vue', name: 'TodoItem.vue' },
      { id: 'Button.vue', name: 'Button.vue' },
      { id: 'App.vue-TodoList.vue', source: 'App.vue', target: 'TodoList.vue' },
      { id: 'App.vue-TodoItem.vue', source: 'App.vue', target: 'TodoItem.vue' },
      { id: 'TodoList.vue-TodoItem.vue', source: 'TodoList.vue', target: 'TodoItem.vue' },
      { id: 'TodoItem.vue-Button.vue', source: 'TodoItem.vue', target: 'Button.vue' },
    ]

    it('should be some statistics',() => {
      const statistics = createComponentStatistics(elements)

      const todoItem = statistics.find((e) => e.name === 'TodoItem.vue')
      const todoList = statistics.find((e) => e.name === 'TodoList.vue')
      const button = statistics.find((e) => e.name === 'Button.vue')
      expect(todoItem).toBeDefined()
      expect(todoList).toBeDefined()
      expect(button).toBeDefined()
      expect(todoItem?.indegree).toBe(2)
      expect(todoList?.indegree).toBe(1)
      expect(button?.indegree).toBe(1)
    })
  })
})
