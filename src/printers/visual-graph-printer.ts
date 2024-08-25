import fs from 'node:fs'
import type { Printer } from '../printer'
import type { Node } from '../node'
import type { ElementDefinition } from 'cytoscape'
import { GraphServer } from './graph-server/server'
import type { ComponentRegistry } from '../registry'
import { toStaticPath } from '../util'
import { CytoscapeGraphStrategy, GraphGenerator } from './graph-generator'
import consola from 'consola'

export class VisualGraphPrinter implements Printer {
  private completedHandler: () => void
  private graphGenerator: GraphGenerator<'cytoscape'>

  constructor(registry: ComponentRegistry) {
    this.graphGenerator = new GraphGenerator(registry, CytoscapeGraphStrategy)
  }

  print(node: Node): void {
    const elements = this.graphGenerator.generate(node)

    this.serve(elements)
  }

  printAll(nodes: Node[]): void {
    const elements = this.graphGenerator.generateAll(nodes)

    this.serve(elements)
  }

  onCompleted(handler: () => void): this {
    this.completedHandler = handler
    return this
  }

  private serve(elements: ElementDefinition[]): void {
    const elementTexts = JSON.stringify(elements)
    const jsonPath = toStaticPath('data.json')

    fs.writeFile(jsonPath, elementTexts, { encoding: 'utf-8' }, (err) => {
      if (err) {
        consola.error(err.message)
        throw err
      }

      if (this.completedHandler) {
        this.completedHandler()
      }
      new GraphServer().start()
    })
  }
}
