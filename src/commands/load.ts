import { defineCommand } from 'citty'
import { Node } from '../node'
import { DefaultComponentsRegistry } from '../registry'
import { vueFileNameOrThrow } from '../util'
import { createPrinter, printerTypeOrThrow } from '../printer'
import { GraphLoader } from '../graph-loader'
import { consola } from 'consola'
import { colorize } from 'consola/utils'

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
      default: 'graph'
    }
  },
  run({ args }) {
    const fileName = args.pageFileName
    const componentsDir = args.componentsDir
    const format = args.format === 'stdout' ? 'stdout' : 'graph'
    const printerType = printerTypeOrThrow(format)
    const vueFileName = vueFileNameOrThrow(fileName)

    consola.info(
      `Exploring "${colorize('blue', vueFileName)}" dependencies from "${colorize('blue', componentsDir)}"`
    )

    // Set the root node to the registry to look self up from it
    // Sometimes there are several `index.vue`, so identify root unique by absolute path
    const registry = new DefaultComponentsRegistry(componentsDir)
    registry.set(vueFileName, vueFileName)

    const rootNode = new Node(vueFileName)
    new GraphLoader(registry).load(rootNode)

    createPrinter(registry, printerType)
      .onCompleted(() => {
        consola.success(colorize('green', `Analysis succeeded for: ${vueFileName}`))
      })
      .print(rootNode)
  },
})
