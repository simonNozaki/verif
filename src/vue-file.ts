import type { ComponentKey } from './registry'
import { type VueFileName, isVueFile } from './util'
import { consola } from 'consola'

/**
 * The object representing Vue file.
 * This makes easier to convert file formats each other.
 */
export class VueFile {
  constructor(
    private _originalPath: VueFileName, // example/components/Snackbar.vue
    private _vueFileName: VueFileName, // Snackbar.vue
    private _componentKey: ComponentKey // snackbar
  ) {}

  static fromOriginal(originalPath: string): VueFile {
    const paths = originalPath.split('/')
    const originalFileName = paths[paths.length - 1]
    if (!isVueFile(originalPath) || !isVueFile(originalFileName)) {
      throw consola.error(new Error(`${originalPath} should be vue file type.`))
    }

    const componentKey = originalFileName.replace('.vue', '').toLowerCase() as Lowercase<string>

    return new VueFile(
      originalPath,
      originalFileName,
      componentKey
    )
  }

  get originalPath(): VueFileName {
    return this._originalPath
  }

  get vueFileName(): VueFileName {
    return this._vueFileName
  }

  get componentKey(): ComponentKey {
    return this._componentKey
  }
}
