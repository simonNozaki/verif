import { Node } from '../src/node'
import { createPrinter } from '../src/printer'
import { DefaultComponentsRegistry } from '../src/registry'
import { vueFileNameOrThrow } from '../src/util'
import { GraphLoader } from '../src/graph-loader'
import { consola } from 'consola'

const fileName = process.argv[2]
const componentsDir = process.argv[3]
const vueFileName = vueFileNameOrThrow(fileName)
consola.start(`Start explore "${vueFileName}" dependencies from a directory "${componentsDir}".`)

// Set the root node to the registry to look self up from it
const registry = new DefaultComponentsRegistry(componentsDir)
registry.set(vueFileName, vueFileName)

const rootNode = new Node(vueFileName)
new GraphLoader(registry).load(rootNode)

createPrinter(registry, 'graph')
  .onCompleted(() => {
    consola.start(`End explore "${vueFileName}" dependencies from a directory "${componentsDir}".`)
  })
  .print(rootNode)
