import { defineCommand } from 'citty'
import { Node } from '../node'
import { setupComponentRegistry } from '../registry'
import { vueFileNameOrThrow } from '../util'
import { createPrinter, PrinterFormat } from '../printer'
import { GraphLoader } from '../graph-loader'
import { consola } from 'consola'
import { colorize } from 'consola/utils'
import { sharedArgs } from './_shared'

export default defineCommand({
  meta: {
    name: 'load',
    description: 'Load dependency graph from a single Vue file source.'
  },
  args: {
    pageFileName: {
      type: 'positional',
      required: true,
      description: 'Root file name to load. Vurif start loading from this file'
    },
    componentsDir: {
      type: 'positional',
      required: true,
      description: '"vurif" target directory to load'
    },
    ...sharedArgs
  },
  run({ args }) {
    const fileName = args.pageFileName
    const componentsDir = args.componentsDir
    const vueFileName = vueFileNameOrThrow(fileName)

    consola.info(
      `Exploring "${colorize('blue', vueFileName)}" dependencies from "${colorize('blue', componentsDir)}"`
    )

    // Set the root node to the registry to look self up from it
    // Sometimes there are several `index.vue`, so identify root unique by absolute path
    const registry = setupComponentRegistry(componentsDir)
    registry.set(vueFileName, vueFileName)

    const rootNode = new Node(vueFileName)
    new GraphLoader(registry).load(rootNode)

    const printerFormat = new PrinterFormat(args.format as string)
    createPrinter(registry, printerFormat.type)
      .onCompleted(() => {
        consola.success(colorize('green', `Analysis succeeded for: ${vueFileName}`))
      })
      .print(rootNode)
  },
})
