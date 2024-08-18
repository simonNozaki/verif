import { consola } from 'consola'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
// Compatible with ESModule and Node.js < 20
const __dirname = path.dirname(__filename)

/**
 * Resolve a path to `static` directory.
 */
export function toStaticPath(_path: string): string {
  return path.join(__dirname, 'static', _path)
}

export type VueFileName = `${string}.vue`

export function isVueFile(str: string): str is VueFileName {
  const matched = str.match(/\.(vue)/)
  return matched !== null
}

/**
 * Asserting to a vue file name with type `VueFileName`, or throw an error
 */
export function vueFileNameOrThrow(pathLike: string): VueFileName {
  if (isVueFile(pathLike)) {
    return pathLike
  }

  throw consola.error(new Error(`${pathLike} should be a vue file.`))
}

/**
 * Avoid too-much importing of collection library
 */
export function groupBy<T, R extends string | number | symbol>(array: T[], transform: (item: T) => R): Partial<Record<R, T[]>> {
  const results: Partial<Record<R, T[]>> = {}

  for (const item of array) {
    const key = transform(item)
    if (!results[key]) {
      results[key] = []
    }
    results[key].push(item)
  }

  return results
}

/**
 * Write buffer to stdout
 */
export function writeStd(buffer: string): void {
  writeStream(process.stdout, buffer)
}

function writeStream(stream: NodeJS.WritableStream, buffer: string): void {
  stream.write(`${buffer}\n`)
}
