import { describe, it, expect } from 'vitest'
import { groupBy } from '../src/util'

describe('#groupBy', () => {
  describe('when an array has no elements', () => {
    const kingdoms: string[] = []

    it('should return an empty object', () => {
      const kingdomGroup = groupBy(kingdoms, (kingdom) => kingdom)

      expect(kingdomGroup).toStrictEqual({})
    })
  })

  describe('when item is a simple text', () => {
    const cities = ['Tokyo', 'Seoul', 'Hongkong', 'Taipei', 'Tokyo', 'Seoul']

    it('should group to same texts', () => {
      const cityGroup = groupBy(cities, (city) => city)

      expect(cityGroup.Tokyo).toBeDefined()
      expect(cityGroup.Tokyo).toHaveLength(2)
      expect(cityGroup.Hongkong).toBeDefined()
      expect(cityGroup.Hongkong).toHaveLength(1)
    })
  })

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
