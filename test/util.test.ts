import { describe, it, expect } from 'vitest'
import { groupBy } from '../src/util'

describe('#groupBy', () => {
  describe('when items have grouping keys', () => {
    const inventory = [
      { name: 'asparagus', type: 'vegetables', quantity: 5 },
      { name: 'bananas', type: 'fruit', quantity: 0 },
      { name: 'goat', type: 'meat', quantity: 23 },
      { name: 'cherries', type: 'fruit', quantity: 5 },
      { name: 'fish', type: 'meat', quantity: 22 },
    ]

    it('should group by key', () => {
      const goodsByType = groupBy(inventory, ({ type }) => type)

      expect(goodsByType.vegetables).toHaveLength(1)
      expect(goodsByType.fruit).toHaveLength(2)
      expect(goodsByType.meat).toHaveLength(2)
    })
  })
})
