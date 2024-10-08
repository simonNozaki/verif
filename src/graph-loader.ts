import type { ComponentKey, ComponentRegistry } from './registry'
import { type Edge, Node } from './node'
import { readFileSync } from 'node:fs'
import { parseComponent, compile, type ASTNode, type ASTElement } from 'vue-template-compiler'
import { consola } from 'consola'
import type { KebabCase, VueFileName } from './util'

/**
 * Convert a text from kebab-case to CamelCase
 */
function toUpperCamelCase<S extends string>(text: S): Capitalize<S> {
  const capitalizeWord = (word: string): Capitalize<S> => {
    return Array.from(word)
      .map((char, index) => index === 0 ? char.toUpperCase() : char.toLowerCase())
      .reduce((result, char) => result + char) as Capitalize<S>
  }

  // from kebab-case
  return text.split('-').map((word) => capitalizeWord(word)).join('') as Capitalize<S>
}

/**
 * Convert a text from CamelCase to kebab-case
 * NOTE: if required this from other files, move to util
 */
function toKebabCase<S extends string>(text: S): KebabCase<S> {
  // Force casting `KebabCase<S>` as result must be kebab-case
  return text
    .replace(/^ *?[A-Z]/, (str) => str.toLowerCase())
    .replace(/ *?[A-Z]/g, (str) => `-${str.replace(/ /g, '').toLowerCase()}`) as KebabCase<S>
}

/**
 * Graph loader starting from a root node
 */
export class GraphLoader {
  constructor(private registry: ComponentRegistry) { }

  // FIXME: Maybe non-side-effect functioning
  load(node: Node): void {
    const ast = this.getAstOrNull(node)
    if (!ast) return

    const tags = [
      ast.tag,
      ...this.traverseTag(ast.children).flat()
    ]

    const edges = tags
      .filter((name): name is ComponentKey => !!this.registry.get(name))
      .reduce((acc, current) => {
        acc[current] = new Node(current)
        return acc
      }, {} as Edge)

    if (Object.entries(edges).length > 0) {
      node.addEdges(edges)
      for (const pair of Object.entries(node.edges)) {
        this.load(pair[1])
      }
    }
  }

  /**
   * Return AST of a Node reading a relevant file
   */
  private getAstOrNull(node: Node): ASTElement | undefined {
    const filePath = this.searchFilePath(node.name)
    if (!filePath) {
      consola.warn(`${node.name} does not found in directory`)
      return
    }

    const vueContentBuf = readFileSync(filePath)
    // Extract template source and convert to AST elements
    const { template } = parseComponent(vueContentBuf.toString())
    if (!template) return

    const { ast } = compile(template.content)
    return ast
  }

  /**
   * Get file path matching by `camelized` or `kebabified` key of original component name
   */
  searchFilePath(name: string): VueFileName | undefined {
    const matchedKey = Array.from(
      [toUpperCamelCase(name), toKebabCase(name), name]
    ).find((n) => !!this.registry.get(n))
    if (!matchedKey) return

    return this.registry.get(matchedKey)
  }

  /**
   * Extract tag names walking along to all nodes recursively
   */
  private traverseTag(astNodes: ASTNode[], tags: string[] = []): string[] {
    for (const an of astNodes) {
      if (an.type !== 1) continue

      if (an.children.length > 0) {
        this.traverseTag(an.children, tags)
      }

      if (an.ifConditions) {
        // Exclude tags that are already included or ASTNode.tag self
        const ifBlockTags = an.ifConditions
          .filter((c) => !tags.includes(c.block.tag))
          .map((c) => c.block.tag)
        tags.push(...ifBlockTags)
      }

      tags.push(an.tag)
    }

    return tags
  }
}
