import type { ComponentKey, ComponentRegistry } from './registry'
import { type Edge, Node } from './node'
import { readFileSync } from 'node:fs'
import { parseComponent, compile, type ASTNode } from 'vue-template-compiler'
import { consola } from 'consola'

/**
 * Graph loader starting from a root node
 */
export class GraphLoader {
  constructor(private registry: ComponentRegistry) { }

  load(node: Node): void {
    const filePath = this.registry.get(node.name)
    if (!filePath) {
      consola.warn(`${node.name} does not found in directory`)
      return
    }

    const vueContentBuf = readFileSync(filePath)
    // Extract template source and convert to AST elements
    const { template } = parseComponent(vueContentBuf.toString())
    if (!template) return

    const { ast } = compile(template.content)
    // Compile to `undefined` when the template is empty
    if (!ast) return

    const tags = [
      ast.tag,
      ...this.traverseTag(ast.children).flat()
    ]

    const edges = tags
      .filter((name): name is ComponentKey => !!this.registry.get(name))
      .reduce((acc, current) => {
        acc[current] = new Node(current)
        return acc
      }, {} as Edge)

    if (Object.entries(edges).length > 0) {
      node.addEdges(edges)
      for (const pair of Object.entries(node.edges)) {
        this.load(pair[1])
      }
    }
  }

  /**
   * Extract tag names walking along to all nodes recursively
   */
  private traverseTag(astNodes: ASTNode[], tags: string[] = []) {
    for (const an of astNodes) {
      if (an.type !== 1) continue

      if (an.children.length > 0) {
        this.traverseTag(an.children, tags)
      }

      tags.push(an.tag)
    }

    return tags
  }
}
