import type { ComponentRegistry } from '../registry'
import type { Printer } from '../printer'
import type { Node } from '../node'

export class ConsolePrinter implements Printer {
  private completedHandler: () => void
  constructor(private registry: ComponentRegistry) {}

  print(node: Node) {
    this.println(node)
    this.runIfHandlerPresent()
  }

  printAll(nodes: Node[]): void {
    for (const node of nodes) {
      this.println(node)
    }
    this.runIfHandlerPresent()
  }

  onCompleted(handler: () => void): this {
    this.completedHandler = handler
    return this
  }

  /**
   * Output the file name along to child nodes recursively
   */
  private println(node: Node, depth = 0) {
    const fileDirs = this.registry.get(node.name).split('/')
    const fileName = fileDirs[fileDirs.length - 1]
    const text = depth > 0 ? `${this.padNth(depth)}<== ${fileName}` : fileName
    console.log(text)

    if (!node.hasEdges()) return

    for (const name in node.edges) {
      const childNode = node.edges[name]
      this.println(childNode, (depth + 1))
    }
  }

  private padNth(times = 1) {
    let paddings = ''
    for (let i = 0; i < times; i++) {
      paddings += '  '
    }
    return paddings
  }

  private runIfHandlerPresent() {
    if (this.completedHandler) {
      this.completedHandler()
    }
  }
}
