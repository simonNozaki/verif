import type { VueFileName } from '../util'
import type { Node } from '../node'
import type { ElementDefinition } from 'cytoscape'
import type { ComponentRegistry } from '../registry'

interface NodeDef {
  id: string
  name: VueFileName
}

export interface EdgeDef {
  id: string,
  source: VueFileName,
  target: VueFileName
}

export function isEdgeDef(element: GraphElement): element is EdgeDef {
  const props = Object.keys(element)
  return props.includes('source') && props.includes('target')
}

/**
 * Custom element definitions
 */
export type GraphElement = NodeDef | EdgeDef

type ElementType = 'cytoscape' | 'object'
type ElementTypeOf<S extends ElementType> = S extends 'cytoscape'
  ? ElementDefinition // cytoscape type definition
  : GraphElement // custom definition

interface GraphStrategy<T> {
  /**
   * Create data representing a node
   */
  createNodeDef(name: VueFileName): T

  /**
   * Create data representing a edge connecting nodes
   */
  createEdgeDef(source: VueFileName, target: VueFileName): T
}

export class CytoscapeGraphStrategy implements GraphStrategy<ElementDefinition> {
  createNodeDef(name: VueFileName): ElementDefinition {
    return {
      data: { id: name }
    }
  }

  createEdgeDef(source: VueFileName, target: VueFileName): ElementDefinition {
    return {
      data: {
        id: `${source}-${target}`,
        source,
        target
      }
    }
  }
}

export class ObjectGraphStrategy implements GraphStrategy<GraphElement> {
  createNodeDef(name: VueFileName): GraphElement {
    return {
      id: name,
      name
    }
  }

  createEdgeDef(source: VueFileName, target: VueFileName): GraphElement {
    return {
      id: `${source}-${target}`,
      source,
      target
    }
  }
}

/**
 * Graph generator creating with output strategy
 * FIXME: redundant parameter(strategy constructor same as type parameter)
 */
export class GraphGenerator<E extends ElementType> {
  private graphStrategy: GraphStrategy<ElementTypeOf<E>>

  constructor(private registry: ComponentRegistry, strategyConstructor: new () => GraphStrategy<ElementTypeOf<E>>) {
    this.graphStrategy = new strategyConstructor()
  }

  /**
   * Create graph elements(nodes and edges).
   */
  createElements(node: Node): ElementTypeOf<E>[] {
    const name = this.registry.get(node.name)
    const nodeDef = this.graphStrategy.createNodeDef(name)

    if (!node.hasEdges()) return [nodeDef]

    const childNodeDefs = Object.entries(node.edges).map((edge: [name: string, n: Node]) => {
      const childNode = edge[1]
      // create a edge leading to child node
      const parentName = this.registry.get(node.name)
      const childName = this.registry.get(childNode.name)
      const edgeDef = this.graphStrategy.createEdgeDef(parentName, childName)
      const childNodeDefs = this.createElements(childNode)

      return [edgeDef, ...childNodeDefs]
    })

    // Safe-typing for Type inference of return type
    const elements = childNodeDefs.flat()
    elements.push(nodeDef)

    return elements
  }
}
