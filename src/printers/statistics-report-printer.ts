import type { ComponentRegistry } from '../registry'
import type { Node } from '../node';
import type { Printer } from '../printer'
import { GraphGenerator, ObjectGraphStrategy, type GraphElement, type EdgeDef, isEdgeDef } from './graph-generator'
import { type VueFileName, groupBy, writeStd } from '../util'

export class SummaryReportPrinter implements Printer {
  private generator: GraphGenerator<'object'>
  private completedHandler: () => void

  constructor(private registry: ComponentRegistry) {
    this.generator = new GraphGenerator<'object'>(this.registry, ObjectGraphStrategy)
  }

  print(node: Node): void {
    const elements = this.generator.createElements(node)
    const statistics = createComponentStatistics(elements)

    const formatter = new StatisticsReportFormatter(statistics)
    const tableData = formatter.format()
    const summary = formatSummary(elements)

    writeReport(tableData, summary, formatter.width)

    this.completedHandler()
  }

  printAll(nodes: Node[]): void {
    throw new Error('Method not implemented.')
  }

  onCompleted(handler: () => void): Printer {
    this.completedHandler = handler
    return this
  }
}

interface ComponentStatistics {
  name: VueFileName
  frequency: number
}

/**
 * Create statistics of each components on the graph.
 * Return frequencies of components name by counting target
 */
function createComponentStatistics(elements: GraphElement[]): ComponentStatistics[] {
  const edges = elements.filter((elm): elm is EdgeDef => isEdgeDef(elm))
  // Group edges by target
  const edgesToComponent = groupBy(edges, ({ target }) => target)

  return Object.keys(edgesToComponent)
    .map((key: VueFileName) => {
      const frequency = edgesToComponent[key].length
      return {
        name: key,
        frequency
      }
    })
}

/**
 * Margin size for the table and summary
 */
const MARGIN_LEFT = '  '

class StatisticsReportFormatter {
  /**
   * Report width through reports
   */
  private _width = 0

  constructor (private statistics: ComponentStatistics[]) {}

  format(): string {
    const nameLengths = this.statistics.map(({ name }) => name.length)
    const nameMaxLength = Math.max(...nameLengths) + 2

    const HEADER_NUMBER = ' # '
    const HEADER_NAME = ' name '
    const HEADER_FREQUENCY = ' frequency '

    // header record
    const headerNumber = padRecord(HEADER_NUMBER, '999'.length, 'left')
    const headerName = padRecord(HEADER_NAME, nameMaxLength, 'left')
    const headerFrequency = padRecord(HEADER_FREQUENCY, HEADER_FREQUENCY.length, 'right')
    const header = ['', headerNumber, headerName, headerFrequency, ''].join('|')
    // Insert margin top of table(adjusted to header line size)
    const marginY = ' '.repeat(header.length)
    const tableBorder = '-'.repeat(header.length)
    this._width = `${MARGIN_LEFT}${tableBorder}`.length

    const records: string[] = []
    records.push(marginY)
    records.push(tableBorder)
    records.push(header)
    records.push(tableBorder)

    // data records
    const frequentStatistics = this.statistics.sort((l, r) => r.frequency - l.frequency)
    for (let i = 0; i < frequentStatistics.length; i++) {
      const statistic = frequentStatistics[i]
      const recordNumber = padRecord((i + 1).toString(), '999'.length, 'left')
      const nameWithPadding = padRecord(statistic.name, nameMaxLength, 'left')
      const frequencyWithPadding = padRecord(statistic.frequency.toString(), HEADER_FREQUENCY.length, 'right')
      const record = ['', recordNumber, nameWithPadding, frequencyWithPadding, ''].join('|')

      records.push(record)
    }

    records.push(tableBorder)
    // Insert margin bottom of table
    records.push(marginY)

    // Add margin left to the table string
    return records.map((record) => `${MARGIN_LEFT}${record}`).join('\n')
  }

  get width(): number {
    return this._width
  }
}

type TextAlign = 'left' | 'right'

/**
 * Space-padding of texts for table record
 * TODO: can abstract padding logic
 */
function padRecord (text: string, max: number, align: TextAlign): string {
  const offset = max - text.length
  const padding = ' '.repeat(offset)

  return align === 'left' ? `${text}${padding}` : `${padding}${text}`
}

/**
 * Create summary text
 */
function formatSummary(elements: GraphElement[]): string {
  const elementByType = groupBy(elements, (item) => isEdgeDef(item) ? 'edge' : 'node')
  const nodeSummary = `🔸 Total nodes: ${elementByType.node?.length}`
  const edgeSummary = `➣  Total edges: ${elementByType.edge?.length}`

  return [nodeSummary, edgeSummary].map((text) => `${MARGIN_LEFT}${text}`).join('\n')
}

function writeReport(tableData: string, summary: string, lineSize: number): void {
  const separationLine = '-'.repeat(lineSize)
  // Add blank to line breaking
  const content = [
    'Node frequencies:',
    tableData,
    separationLine,
    'Summary: ',
    '',
    summary,
    ''
  ].join('\n')

  writeStd(content)
}
