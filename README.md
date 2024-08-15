# Vurif

[![npm version](https://img.shields.io/npm/v/vurif?color=yellow)](https://npmjs.com/package/vurif)
[![npm downloads](https://img.shields.io/npm/dm/vurif?color=yellow)](https://npmjs.com/package/vurif)

> Component dependency Analyzer for Vue.js 2.

*"Vue verifier"* : CLI tool to visualize dependencies by graph.

💡 **Epic Features:**

- Analyze dependency from a page(pages) through directory
- Visualize dependency by graph

> [!CAUTION]
> Works only Vue.js 2 (Not guarantee to work on Vue 3)

📒 **Key Concepts:**

- Vue/Nuxt projects often have view files in `views`, `pages` and components in `components`.
- Vurif loads starting from view files and resolves dependencies in `components` recursively.

> [!NOTE]
> Vurif assumes that component names in vue files match `components` file name.
> In the future, maybe able to parse much dynamic.

❗ **This project is under development.** Please pay attention to use this tool.

## Usage

### Install

```bash
# npm
npm i -g vurif

# yarn
yarn add -g vurif
```

### Analysis and Visualization

Analyze dependencies of one view file:

```bash
vurif load <vue-file> <components-dir>
# vurif load example/pages/index.vue example/components
```

Analyze dependencies of source root file:

```bash
vurif load <source-dir> <components-dir>
# vurif load-all example/pages/ example/components
```

Subcommands has only `load` currently. See also `vurif --help`

Vurif output dependency analysis by standard output or visual graph.

![graph](./docs/graph-image.png)

### Options

Available option sets:

|#|parameters|values|
| ---- | ---- | ---- |
|1| `format` | `stdout` , `graph` . Default: `graph` |

## Development

Requirements: Node.js >=18

- Enable corepack: `corepack enable`
- Install dependencies: `pnpm install`
- Execute locally: `pnpm dev load example/App.vue example/`
