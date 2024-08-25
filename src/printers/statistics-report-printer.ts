import type { ComponentRegistry } from '../registry'
import type { Node } from '../node';
import type { Printer } from '../printer'
import { GraphGenerator, ObjectGraphStrategy, type GraphElement, type EdgeDef, isEdgeDef } from './graph-generator'
import { type TextAlign, type VueFileName, groupBy, textAlign, vueFileNameOrThrow, writeStdout } from '../util'

/**
 * Printer for reporting graph elements statistics.
 */
export class StatisticsReportPrinter implements Printer {
  private generator: GraphGenerator<'object'>
  private completedHandler: () => void

  constructor(private registry: ComponentRegistry) {
    this.generator = new GraphGenerator<'object'>(this.registry, ObjectGraphStrategy)
  }

  print(node: Node): void {
    const elements = this.generator.generate(node)
    this.writeReport(elements)
  }

  printAll(nodes: Node[]): void {
    const elements = this.generator.generateAll(nodes)
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
      'Node degrees:',
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

export interface ComponentStatistics {
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
  // FIXME: Improve `select count group by`
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

interface StatisticsCell {
  value: string
  length: number
}

/**
 * Type definition for a table with column definitions
 */
interface StatisticsRecordColumns {
  rowNum: StatisticsCell
  name: StatisticsCell
  indegree: StatisticsCell
  outdegree: StatisticsCell
}

/**
 * Margin size for the table and summary
 */
const MARGIN_LEFT = '  '

export class StatisticsReportFormatter {
  /**
   * Report width through reports
   */
  private _width = 0

  private _maxNameLength = 0
  private _tableBorder = ''

  // table header columns

  private readonly HEADER_ROWNUM = ' # '
  private readonly HEADER_NAME = ' name '
  private readonly HEADER_INDEGREE = ' indegree '
  private readonly HEADER_OUTDEGREE = ' outdegree '

  constructor (private statistics: ComponentStatistics[]) {}

  format(): string {
    this.calculateMaxNameLength()

    const records: string[] = []
    const headerRecord = this.createHeaderRow()
    records.push(...headerRecord)

    const dataRecords = this.createDataRows()
    records.push(...dataRecords)
    // Insert margin bottom of table
    records.push(this._tableBorder, '')

    // Add margin left to the table string
    return records.map((record) => `${MARGIN_LEFT}${record}`).join('\n')
  }

  calculateMaxNameLength(): void {
    const nameMaxLength = Math.max(...this.statistics.map(({ name }) => name.length)) + 2
    this._maxNameLength = nameMaxLength
  }

  /**
   * Create header lins of report table
   * @example
   * ```
   *  ----------------------------------------------------------------------
   *  | # | name                                    | indegree | outdegree |
   *  ----------------------------------------------------------------------
   * ```
   */
  createHeaderRow(): string[] {
    const nameMaxLength = Math.max(...this.statistics.map(({ name }) => name.length)) + 2
    const columns: StatisticsRecordColumns = {
      rowNum: { value: this.HEADER_ROWNUM, length: 3 },
      name: { value: this.HEADER_NAME, length: nameMaxLength },
      indegree: { value: this.HEADER_INDEGREE, length: this.HEADER_INDEGREE.length },
      outdegree: { value: this.HEADER_OUTDEGREE, length: this.HEADER_OUTDEGREE.length },
    }
    const header = this.createTableRow(columns).join('|')
    // TODO: Make private properties initializing more immutable
    this._tableBorder = '-'.repeat(header.length)
    this._width = `${MARGIN_LEFT}${this._tableBorder}`.length

    // Insert the header row with margin top by a blank line
    return ['', this._tableBorder, header, this._tableBorder]
  }

  /**
   * Create data records of report table
   * @example
   * ```
   *  |1  |example/components/atoms/Message.vue     |         2|          0|
   * ```
   */
  createDataRows(): string[] {
    const statisticsOrderByIndegree = this.statistics.sort((l, r) => r.indegree - l.indegree)

    return statisticsOrderByIndegree
      .map((statistic: ComponentStatistics, i: number) => {
        const columns: StatisticsRecordColumns = {
          rowNum: { value: (i + 1).toString(), length: 3 },
          name: { value: statistic.name, length: this._maxNameLength },
          indegree: { value: statistic.indegree.toString(), length: this.HEADER_INDEGREE.length },
          outdegree: { value: statistic.outdegree.toString(), length: this.HEADER_OUTDEGREE.length },
        }

        return this.createTableRow(columns).join('|')
      })
  }

  /**
   * Create an array consisted of each column data
   */
  createTableRow(columns: StatisticsRecordColumns): string[] {
    const padRecord = (text: string, max: number, align: TextAlign): string => {
      const offset = max - text.length
      return textAlign(text, offset, align)
    }

    const rowNum = padRecord(columns.rowNum.value, columns.rowNum.length, 'left')
    const nameWithPadding = padRecord(columns.name.value, columns.name.length, 'left')
    const indegreeWithPadding = padRecord(columns.indegree.value, columns.indegree.length, 'right')
    const outdegreeWithPadding = padRecord(columns.outdegree.value, columns.outdegree.length, 'right')

    return ['', rowNum, nameWithPadding, indegreeWithPadding, outdegreeWithPadding, '']
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
