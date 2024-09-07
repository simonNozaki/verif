import type { Node } from './node'
import type { ComponentRegistry } from './registry'
import { ConsolePrinter, VisualGraphPrinter, StatisticsReportPrinter } from './printers'

type PrinterType = 'stdout' | 'graph' | 'report'

/**
 * Printer type formatter, set default as 'graph'
 */
export class PrinterFormat {
  private readonly types = ['stdout', 'graph', 'report']
  private readonly _type: PrinterType

  constructor (private _value: string | undefined) {
    this._type = this.types.includes(this._value)
      ? (this._value as PrinterType)
      : 'graph'    
  }

  get type(): PrinterType {
    return this._type
  }
}

export interface Printer {
  print(node: Node): void
  printAll(nodes: Node[]): void
  onCompleted(handler: () => void): Printer
}

/**
 * Factory method of `Printer` s.
 */
export function createPrinter(registry: ComponentRegistry, type: PrinterType): Printer {
  let printerConstructor: new (registry: ComponentRegistry) => Printer
  switch (type) {
    case 'graph':
      printerConstructor = VisualGraphPrinter
      break
    case 'report':
      printerConstructor = StatisticsReportPrinter
      break
    default:
      printerConstructor = ConsolePrinter
  }
  return new printerConstructor(registry)
}
