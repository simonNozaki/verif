import type { ComponentKey } from './registry'

export type Edge = { [k: string]: Node }

/**
 * Node data structure
 */
export class Node {
  constructor(
    private readonly _name: ComponentKey,
    private _edges: { [k: string]: Node } = {}
  ) {}

  addEdges(edges: { [k: string]: Node }) {
    this._edges = {
      ...this._edges,
      ...edges,
    }
  }

  hasEdges(): boolean {
    return Object.entries(this._edges).length > 0
  }

  get edges(): Edge {
    return this._edges
  }

  get name() {
    return this._name
  }
}
