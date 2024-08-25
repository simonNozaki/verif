import type { ComponentRegistry } from '../registry'
import type { Printer } from '../printer'
import type { Node } from '../node'
import { writeStdout, textAlign } from '../util'
import { consola } from 'consola'

export class ConsolePrinter implements Printer {
  private completedHandler: () => void
  constructor(private registry: ComponentRegistry) {}

  print(node: Node) {
    const lines = this.createLines(node)
    this.execute(lines)
  }

  printAll(nodes: Node[]): void {
    const lines = nodes.flatMap((node) => this.createLines(node))
    this.execute(lines)
  }

  private execute(lines: string[]): void {
    // Insert margin to X, Y axis. Margin Y is presented by blank lines
    const spacedGraphText = ['', ...lines, '']
      .map((line) => textAlign(line, 2, 'right'))
      .join('\n')
    consola.success('Succeeded to create the graph.')
    writeStdout(spacedGraphText)

    if (this.completedHandler) {
      this.completedHandler()
    }
  }

  onCompleted(handler: () => void): this {
    this.completedHandler = handler
    return this
  }

  /**
   * Create dependency graph lines.
   * Pad aligning to right by depth
   */
  createLines(node: Node, depth = 0): string [] {
    const text = this.createLine(node, depth)

    if (!node.hasEdges()) {
      return [text]
    }

    const edges = Object.keys(node.edges).flatMap((name) => {
      const child = node.edges[name]
      return this.createLines(child, (depth + 1))
    })

    return [text, ...edges]
  }

  private createLine(node: Node, depth: number): string {
    const fileName = this.registry.get(node.name)
    if (depth === 0) return fileName

    // e.g. `  └── InputNumber.vue`
    return textAlign(`└── ${fileName}`, (depth * 2), 'right')
  }
}
