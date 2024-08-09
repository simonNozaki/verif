import { ComponentKey, ComponentRegistry } from './registry';
import { Edge, Node } from './node';
import { readFileSync } from 'fs';
import { parseComponent, compile, ASTNode } from 'vue-template-compiler';

/**
 * Graph loader starting from a root node
 */
export class GraphLoader {
  constructor(private registry: ComponentRegistry) {}

  load(node: Node) {
    const filePath = this.registry.get(node.name)
    const vueContentBuf = readFileSync(filePath)
    // Extract template source and convert to AST elements
    const { template } = parseComponent(vueContentBuf.toString())
    const { ast } = compile(template.content)
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

    if(Object.entries(edges).length > 0) {
      node.addEdges(edges)
      Object.entries(node.edges).forEach(([_, edge]) => this.load(edge))
    }
  }

  /**
   * Extract tag names walking along to all nodes recursively
   */
  private traverseTag(astNodes: ASTNode[], tags: string[] = []) {
    astNodes.forEach((an) => {
      if (an.type !== 1) return

      if (an.children.length > 0) {
        this.traverseTag(an.children, tags)
      }

      tags.push(an.tag)
    })
    return tags
  }
}
