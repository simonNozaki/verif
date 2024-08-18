import type { Node } from './node'
import type { ComponentRegistry } from './registry'
import { ConsolePrinter, VisualGraphPrinter, SummaryReportPrinter } from './printers'

type PrinterType = 'stdout' | 'graph' | 'report'

/**
 * Assert and safe cast to `PrinterType`
 */
export function getPrinterType(type: string): PrinterType {
  if (type === 'stdout' || type === 'graph' || type === 'report') {
    return type as PrinterType
  }
  return 'graph'
}

export interface Printer {
  print(node: Node): void
  printAll(nodes: Node[]): void
  onCompleted(handler: () => void): Printer
}

/**
 * Factory method of `Printer` s.
 */
export function createPrinter(registry: ComponentRegistry, type: PrinterType | undefined = 'stdout'): Printer {
  switch (type) {
    case 'graph':
      return new VisualGraphPrinter(registry)
    case 'report':
      return new SummaryReportPrinter(registry)
    default:
      return new ConsolePrinter(registry)
  }
}
