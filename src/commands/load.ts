import { defineCommand } from 'citty'
import { Node } from '../node'
import { DefaultComponentsRegistry } from '../registry'
import { vueFileNameOrThrow } from '../util'
import { createPrinter, printerTypeOrThrow } from '../printer'
import { VueFile } from '../vue-file'
import { GraphLoader } from '../graph-loader'
import { consola } from 'consola'

export default defineCommand({
  meta: {
    name: 'load',
    description: 'Load dependency graph from a single Vue file source.'
  },
  args: {
    pageFileName: {
      type: 'positional',
      required: true,
      description: 'Root file name to load. Verif start loading from this file'
    },
    componentsDir: {
      type: 'positional',
      required: true,
      description: '"verif" target directory to load'
    },
    format: {
      type: 'string',
      required: false,
      default: 'graph'
    }
  },
  run({ args }) {
    const fileName = args.pageFileName
    const componentsDir = args.componentsDir
    const format = args.format === 'stdout' ? 'stdout' : 'graph'
    const printerType = printerTypeOrThrow(format)
    const vueFileName = vueFileNameOrThrow(fileName)

    consola.start(`Start explore "${vueFileName}" dependencies from a directory "${componentsDir}".`)

    // Set the root node to the registry to look self up from it
    const registry = new DefaultComponentsRegistry(componentsDir)
    const vueFile = VueFile.fromOriginal(fileName)
    registry.set(vueFile.componentKey, vueFileName)

    const rootNode = new Node(vueFile.componentKey)
    new GraphLoader(registry).load(rootNode)

    createPrinter(registry, printerType)
      .onCompleted(() => {
        consola.start(`End explore "${vueFileName}" dependencies from a directory "${componentsDir}".`)
      })
      .print(rootNode)
  },
})
