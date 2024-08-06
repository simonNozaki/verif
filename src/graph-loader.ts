import { ComponentKey, ComponentRegistry } from './registry';
import { Edge, Node } from './node';
import { ChildNode, Document, NodeWithChildren, Element }from 'domhandler'
import { toLowerCase, VueFileName } from './util';
import { readFileSync } from 'fs';
import { parseDocument } from 'htmlparser2';
import { parseComponent } from 'vue-template-compiler';

/**
 * Graph loader starting from a root node
 */
export class GraphLoader {
  constructor(private registry: ComponentRegistry) {}

  load(node: Node) {
    const filePath = this.registry.get(node.name)
    const dom = this.getVueTemplateDom(filePath)
    // An array of component names that this got by reading a Vue file.
    // Mapping casts to lower case since DOM string read by `domhandler` are all lowercases.
    const childNodeNames = dom.children
      .map((child) => child instanceof NodeWithChildren ? this.traverseChildren(child.children) : [])
      .flat()
      .map((name) => toLowerCase(name))
    const edges = childNodeNames
      .filter((name): name is ComponentKey => !!this.registry.get(name))
      .reduce((acc, current) => {
        acc[current] = new Node(current)
        return acc
      }, {} as Edge)

    if (Object.entries(edges).length > 0) {
      node.addEdges(edges)
      Object.entries(node.edges).forEach(([_, edge]) => this.load(edge))
    }
  }

  /**
   * Extract DOM element names walking along to all nodes recursively
   */
  private traverseChildren(childrenNodes: ChildNode[], results: string[] = []): string[] {
    childrenNodes.forEach((child) => {
      if (!(child instanceof NodeWithChildren)) return

      if (child.children.length > 0) {
        this.traverseChildren(child.children, results)
      }

      if (child instanceof Element) {
        results.push(child.tagName)
      }
    })
    return results.flat()
  }

  /**
   * Return a DOM object from a vue file name
   */
  private getVueTemplateDom(fileName: VueFileName): Document {
    const vueContentBuf = readFileSync(fileName)
    const { template } = parseComponent(vueContentBuf.toString())
    return parseDocument(template.content)
  }
}
