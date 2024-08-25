import Mustache from 'mustache'
import fs from 'node:fs'
import type { Printer } from '../printer'
import type { Node } from '../node'
import type { ElementDefinition } from 'cytoscape'
import { GraphServer } from './graph-server/server'
import type { ComponentRegistry } from '../registry'
import { toStaticPath } from '../util'
import { CytoscapeGraphStrategy, GraphGenerator } from './graph-generator'

function writeJavaScript(data: ElementDefinition[]): void {
  // TODO: ファイルの読み書きを待たない
  const template = fs.readFileSync(toStaticPath('cy.client.js.template'))

  const output = Mustache.render(template.toString(), {
    elements: JSON.stringify(data)
  })

  const jsPath = toStaticPath('cy.client.js')

  if (fs.existsSync(jsPath)) {
    fs.rmSync(jsPath)
  }

  fs.writeFileSync(jsPath, output, { encoding: 'utf-8' })
}

export class VisualGraphPrinter implements Printer {
  private completedHandler: () => void
  private graphGenerator: GraphGenerator<'cytoscape'>

  constructor(registry: ComponentRegistry) {
    this.graphGenerator = new GraphGenerator(registry, CytoscapeGraphStrategy)
  }

  print(node: Node): void {
    const elements = this.graphGenerator.generate(node)

    writeJavaScript(elements)

    this.completedHandler()
    new GraphServer().start()
  }

  printAll(nodes: Node[]): void {
    const elements = this.graphGenerator.generateAll(nodes)

    writeJavaScript(elements)

    this.completedHandler()
    new GraphServer().start()
  }

  onCompleted(handler: () => void): this {
    this.completedHandler = handler
    return this
  }
}
