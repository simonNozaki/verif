import { readdirSync, lstatSync } from 'fs'
import { isVueFile, toLowerCase, VueFileName } from './util'
import { VueFile } from './vue-file'
import { consola } from 'consola'

export type ComponentKey = keyof ComponentDictionary & Lowercase<string>

/**
 * The object maintaining data that has the format `lowercase component name: a file path`.
 */
interface ComponentDictionary {
  [k: Lowercase<string>]: VueFileName
}

let components: ComponentDictionary = {}

/**
 * Component names registry. This provides safe accesses to the global registry.
 */
export interface ComponentRegistry {
  get(key: ComponentKey): VueFileName
  set(key: Lowercase<string>, value: VueFileName): void
}

export class DefaultComponentsRegistry implements ComponentRegistry {
  constructor(componentsDir: string) {
    components = readDirDeepSync(componentsDir)
  }

  get(key: ComponentKey): VueFileName {
    if (!components) {
      throw consola.error(new Error('Components directory is not initialized.'))
    }
    return components[key]
  }
  set(key: string, value: VueFileName): void {
    // Dare to accept all lowercase strings
    components[(toLowerCase(key))] = value
  }
}

/**
 * Return Vue file name and path walking along to a directory path of argument
 */
function readDirDeepSync(pathLike: string, results: ComponentDictionary = {}): ComponentDictionary {
  if (isVueFile(pathLike)) {
    const componentKey = VueFile.fromOriginal(pathLike).componentKey
    results[componentKey] = pathLike
    return
  }

  // Exclude non-Vue file
  if (lstatSync(pathLike).isFile()) {
    return
  }

  // 現在いる階層から下の階層をたどってパスをすべて探す
  const pathNames = readdirSync(pathLike)
  pathNames.forEach((path) => readDirDeepSync(`${pathLike}/${path}`, results))

  return results
}
