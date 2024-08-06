import { ComponentRegistry } from '../registry'
import { type Printer } from '../printer'
import { Node } from '../node'

export class ConsolePrinter implements Printer {
  private completedHandler: () => void
  constructor(private registry: ComponentRegistry) {}

  print(node: Node) {
    this.println(node)
    if (this.completedHandler) {
      this.completedHandler()
    }
  }

  onCompleted(handler: () => void): this {
    this.completedHandler = handler
    return this
  }

  /**
   * Output the file name along to child nodes recursively
   */
  private println(node: Node, depth: number = 0) {
    // ファイルパスからファイル名だけを取り出す
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

  private padNth(times: number = 1) {
    let paddings = ''
    for (let i = 0; i < times; i++) {
      paddings += '  '
    }
    return paddings
  }
}
