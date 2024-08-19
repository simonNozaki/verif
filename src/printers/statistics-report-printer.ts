import type { ComponentRegistry } from '../registry'
import type { Node } from '../node';
import type { Printer } from '../printer'
import { GraphGenerator, ObjectGraphStrategy, type GraphElement, type EdgeDef, isEdgeDef } from './graph-generator'
import { type TextAlign, type VueFileName, groupBy, textAlign, vueFileNameOrThrow, writeStdout } from '../util'

export class SummaryReportPrinter implements Printer {
  private generator: GraphGenerator<'object'>
  private completedHandler: () => void

  constructor(private registry: ComponentRegistry) {
    this.generator = new GraphGenerator<'object'>(this.registry, ObjectGraphStrategy)
  }

  print(node: Node): void {
    const elements = this.generator.createElements(node)
    this.writeReport(elements)
  }

  printAll(nodes: Node[]): void {
    const elements = nodes.flatMap((node) => this.generator.createElements(node))
    this.writeReport(elements)
  }

  onCompleted(handler: () => void): Printer {
    this.completedHandler = handler
    return this
  }

  /**
   * Create table data and summary by text, then print to stdout
   */
  private writeReport(elements: GraphElement[]): void {
    const statistics = createComponentStatistics(elements)

    const formatter = new StatisticsReportFormatter(statistics)
    const tableData = formatter.format()
    const summary = formatSummary(elements)

    const separationLine = '-'.repeat(formatter.width)
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
    writeStdout(content)

    this.completedHandler()
  }
}

interface ComponentStatistics {
  name: VueFileName
  indegree: number
  outdegree: number
}

/**
 * Create statistics of each components on the graph.
 * Return frequencies of components name by counting target
 */
export function createComponentStatistics(elements: GraphElement[]): ComponentStatistics[] {
  const edges = elements.filter((elm): elm is EdgeDef => isEdgeDef(elm))
  // Group edges by target
  const edgesByIndegree = groupBy(edges, ({ target }) => target)
  const edgesByOutdegree = groupBy(edges, ({ source }) => source)

  // Create keys set combined with indegree and outdegree
  const vueFileNameKeys = Object.keys(edgesByIndegree).concat(Object.keys(edgesByOutdegree)).map((k) => vueFileNameOrThrow(k))
  const vueFileNameSet = new Set(vueFileNameKeys)

  const results = []
  for (const vueFileName of vueFileNameSet.keys()) {
    const indegree = edgesByIndegree[vueFileName]?.length ?? 0
    const outdegree = edgesByOutdegree[vueFileName]?.length ?? 0
    results.push({
      name: vueFileName,
      indegree,
      outdegree
    })
  }

  return results
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
    const HEADER_FREQUENCY = ' indegree '
    const padRecord = (text: string, max: number, align: TextAlign): string => {
      const offset = max - text.length
      return textAlign(text, offset, align)
    }

    // header record
    // TODO: May can refactor by extracting a function
    const headerNumber = padRecord(HEADER_NUMBER, '999'.length, 'left')
    const headerName = padRecord(HEADER_NAME, nameMaxLength, 'left')
    const headerFrequency = padRecord(HEADER_FREQUENCY, HEADER_FREQUENCY.length, 'right')
    const header = ['', headerNumber, headerName, headerFrequency, ''].join('|')
    const tableBorder = '-'.repeat(header.length)
    this._width = `${MARGIN_LEFT}${tableBorder}`.length

    const records: string[] = []
    // Insert margin top of table(adjusted to header line size)
    records.push('')
    records.push(tableBorder)
    records.push(header)
    records.push(tableBorder)

    // data records
    const frequentStatistics = this.statistics.sort((l, r) => r.indegree - l.indegree)
    for (let i = 0; i < frequentStatistics.length; i++) {
      const statistic = frequentStatistics[i]
      const recordNumber = padRecord((i + 1).toString(), '999'.length, 'left')
      const nameWithPadding = padRecord(statistic.name, nameMaxLength, 'left')
      const frequencyWithPadding = padRecord(statistic.indegree.toString(), HEADER_FREQUENCY.length, 'right')
      const record = ['', recordNumber, nameWithPadding, frequencyWithPadding, ''].join('|')

      records.push(record)
    }

    records.push(tableBorder)
    // Insert margin bottom of table
    records.push('')

    // Add margin left to the table string
    return records.map((record) => `${MARGIN_LEFT}${record}`).join('\n')
  }

  get width(): number {
    return this._width
  }
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
