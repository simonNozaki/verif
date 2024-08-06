import { Node } from './node'
import { ComponentRegistry } from './registry'
import { ConsolePrinter } from './printers'
import { VisualGraphPrinter } from './printers/visual-graph-printer'

type PrinterType = 'stdout' | 'graph'

export function printerTypeOrThrow(type: string): PrinterType {
  if (type === 'stdout' || type === 'graph') {
    return type as PrinterType
  }
  throw new Error(`Invalid printer type: ${type}`)
}

export interface Printer {
  print(node: Node): void

  onCompleted(handler: () => void): Printer
}

/**
 * Factory method of `Printer` s.
 */
export function createPrinter(registry: ComponentRegistry, type: PrinterType | undefined = 'stdout'): Printer {
  if (type === 'graph') {
    return new VisualGraphPrinter(registry)
  }
  return new ConsolePrinter(registry)
}
