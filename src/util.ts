import { consola } from 'consola'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const __filename = fileURLToPath(import.meta.url)
// Compatible for Node.js < 20
export const __dirname = path.dirname(__filename)

/**
 * Resolve a path to `static` directory.
 */
export function toStaticPath(_path: string): string {
  return path.join(__dirname, 'static', _path)
}

/**
 * Convert to lowercase then cast `Lowercase`
 */
export function toLowerCase(str: string): Lowercase<string> {
  return str.toLowerCase() as Lowercase<string>
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
