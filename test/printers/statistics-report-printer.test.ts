import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { GraphElement } from '../../src/printers/graph-generator'
import {
  type ComponentStatistics,
  createComponentStatistics,
  StatisticsReportFormatter
} from '../../src/printers/statistics-report-printer'
import type { VueFileName } from '../../src/util'

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

      expect(statistics).toHaveLength(2)
      const app = statistics.find((e) => e.name === 'App.vue')
      const button = statistics.find((e) => e.name === 'Button.vue')
      expect(app?.name).toBe('App.vue')
      expect(app?.indegree).toBe(0)
      expect(app?.outdegree).toBe(1)
      expect(button?.name).toBe('Button.vue')
      expect(button?.indegree).toBe(1)
      expect(button?.outdegree).toBe(0)
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

      expect(statistics).toHaveLength(3)
      const app = statistics.find((e) => e.name === 'App.vue')
      const about = statistics.find((e) => e.name === 'About.vue')
      const button = statistics.find((e) => e.name === 'Button.vue')
      expect(app?.indegree).toBe(0)
      expect(app?.outdegree).toBe(1)
      expect(about?.indegree).toBe(0)
      expect(about?.outdegree).toBe(1)
      expect(button?.indegree).toBe(2)
      expect(button?.outdegree).toBe(0)
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

      const app = statistics.find((e) => e.name === 'App.vue')
      const todoItem = statistics.find((e) => e.name === 'TodoItem.vue')
      const todoList = statistics.find((e) => e.name === 'TodoList.vue')
      const button = statistics.find((e) => e.name === 'Button.vue')
      expect(app).toBeDefined()
      expect(todoItem).toBeDefined()
      expect(todoList).toBeDefined()
      expect(button).toBeDefined()
      expect(app?.indegree).toBe(0)
      expect(app?.outdegree).toBe(2)
      expect(todoItem?.indegree).toBe(2)
      expect(todoItem?.outdegree).toBe(1)
      expect(todoList?.indegree).toBe(1)
      expect(todoList?.outdegree).toBe(1)
      expect(button?.indegree).toBe(1)
      expect(button?.outdegree).toBe(0)
    })
  })
})

describe('StatisticsReportFormatter#createHeaderRow', () => {
  describe('when statistics has an element', () => {
    const statistics: ComponentStatistics[] = [
      { name: 'components/todo/TodoList.vue', indegree: 1, outdegree: 2 },
      { name: 'components/todo/Todo.vue', indegree: 1, outdegree: 0 },
      { name: 'components/Card.vue', indegree: 1, outdegree: 0 }
    ]
    let formatter: StatisticsReportFormatter
    beforeEach(() => {
      formatter = new StatisticsReportFormatter(statistics)
      // Calculating table width
      formatter.calculateMaxNameLength()
    })

    it('should create a size adjusted header', () => {
      const headerRow = formatter.createHeaderRow()

      expect(headerRow).toHaveLength(4)
      expect(headerRow[0]).toBe('')
      expect(headerRow[1]).toBe('-----------------------------------------------------------')
      expect(headerRow[2]).toBe('| # | name                         | indegree | outdegree |')
      expect(headerRow[3]).toBe('-----------------------------------------------------------')
    })
  })
})

describe('StatisticsReportFormatter#createDataRows', () => {
  describe.each([
    { name: 'App.vue', expectation: 'App.vue  ' },
    { name: 'example/components/Button.vue', expectation: 'example/components/Button.vue  ' },
  ]) ('when statistics has an element', ({ name, expectation }) => {
    const statistics: ComponentStatistics[] = [
      { name: name as VueFileName, indegree: 1, outdegree: 2 }
    ]
    let formatter: StatisticsReportFormatter
    beforeEach(() => {
      formatter = new StatisticsReportFormatter(statistics)
      // Calculating table width
      formatter.calculateMaxNameLength()
      formatter.createHeaderRow()
    })

    it('should create an array', () => {
      const dataRows = formatter.createDataRows()

      expect(dataRows).toHaveLength(1)
      expect(dataRows[0]).toBe(`|1  |${expectation}|         1|          2|`)
    })
  })

  describe('when statistics has some elements', () => {
    const statistics: ComponentStatistics[] = [
      { name: 'pages/index.vue', indegree: 0, outdegree: 1 },
      { name: 'components/App.vue', indegree: 1, outdegree: 2 },
      { name: 'components/Button.vue', indegree: 1, outdegree: 0 },
      { name: 'components/Message.vue', indegree: 1, outdegree: 0 },
    ]
    let formatter: StatisticsReportFormatter
    beforeEach(() => {
      formatter = new StatisticsReportFormatter(statistics)
      // Calculating table width
      formatter.calculateMaxNameLength()
      formatter.createHeaderRow()
    })

    it('should adjust table size by the longest row', () => {
      const dataRows = formatter.createDataRows()

      expect(dataRows).toHaveLength(4)
      expect(dataRows[0]).toBe('|1  |components/App.vue      |         1|          2|')
      expect(dataRows[1]).toBe('|2  |components/Button.vue   |         1|          0|')
      expect(dataRows[2]).toBe('|3  |components/Message.vue  |         1|          0|')
      expect(dataRows[3]).toBe('|4  |pages/index.vue         |         0|          1|')
    })
  })
})
