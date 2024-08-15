import { readdirSync, lstatSync } from 'node:fs'
import { isVueFile, type VueFileName } from './util'
import { consola } from 'consola'

export type ComponentKey = keyof ComponentDictionary & string

/**
 * The object maintaining data that has the format `lowercase component name: a file path`.
 */
export interface ComponentDictionary {
  [k: string]: VueFileName
}

/**
 * Global component store object. Only `ComponentRegistry` can access this object.
 */
const components: ComponentDictionary = {}

/**
 * Component names registry. This provides safe accesses to the global registry.
 */
export interface ComponentRegistry {
  get(key: ComponentKey): VueFileName
  set(key: string, value: VueFileName): void
  setAll(entries: ComponentDictionary): void
}

export class DefaultComponentsRegistry implements ComponentRegistry {
  get(key: ComponentKey): VueFileName {
    if (!components) {
      throw consola.error(new Error('Components directory is not initialized.'))
    }
    return components[key]
  }

  set(key: string, value: VueFileName): void {
    components[key] = value
  }

  setAll(entries: ComponentDictionary): void {
    Object.assign(components, entries)
  }
}

/**
 * Create and initialize a component registry by "components" directory.
 * NOTE: If need, consider "builder" to configure initialization.
 */
export function setupComponentRegistry(componentsDir: string): ComponentRegistry {
  const registry = new DefaultComponentsRegistry()
  const componentPaths = readDirDeepSync(componentsDir)
  registry.setAll(componentPaths)
  return registry
}

type OutputStrategyType = ComponentDictionary | Set<string>

/**
 * Output strategy of loading Vue files in a directory.
 */
interface OutputStrategy<T extends OutputStrategyType> {
  addEntry(pathLike: VueFileName): void
  addEntires(entries: T): void
  getEntries(): T
}

class ObjectOutputStrategy implements OutputStrategy<ComponentDictionary> {
  private results: ComponentDictionary = {}

  addEntry(pathLike: VueFileName): void {
    const paths = pathLike.split('/')
    const componentName = paths[paths.length - 1].replace('.vue', '')
    // format ... Card: 'example/Card.vue'
    this.results[componentName] = pathLike
  }

  addEntires(entries: ComponentDictionary): void {
    Object.assign(this.results, entries)
  }

  getEntries(): ComponentDictionary {
    return this.results
  }
}

class StringSetOutputStrategy implements OutputStrategy<Set<string>> {
  private results: Set<string> = new Set()

  addEntry(pathLike: VueFileName): void {
    // format ... 'example/Card.vue', no manipulations of path format
    this.results.add(pathLike)
  }

  addEntires(entries: Set<string>): void {
    for (const entry of entries) {
      this.results.add(entry)
    }
  }

  getEntries(): Set<string> {
    return this.results
  }
}

/**
 * Read directory deeply and return Vue file name and path.
 */
function readDirDeepBase<T extends OutputStrategyType>(pathLike: string, outputStrategy: OutputStrategy<T>): T {
  if (isVueFile(pathLike)) {
    outputStrategy.addEntry(pathLike)
    return outputStrategy.getEntries()
  }

  // Exclude non-Vue file
  if (lstatSync(pathLike).isFile()) {
    return outputStrategy.getEntries()
  }

  const pathNames = readdirSync(pathLike)
  for (const path of pathNames) {
    const entries = readDirDeepBase(`${pathLike}/${path}`, outputStrategy)
    outputStrategy.addEntires(entries)
  }

  return outputStrategy.getEntries()
}

/**
 * Return Vue file name and path walking along to a directory path of argument.
 * Read only `.vue` file or directories.
 */
export function readDirDeepSync(pathLike: string): ComponentDictionary {
  return readDirDeepBase(pathLike, new ObjectOutputStrategy())
}

/**
 * Return Vue file paths walking along to a directory path of argument.
 * Results paths are all full path format.
 */
export function readDirDeepSyncAsPaths(pathLike: string): Set<string> {
  return readDirDeepBase(pathLike, new StringSetOutputStrategy())
}
