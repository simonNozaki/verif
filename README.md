# Vurif

> Component dependency Analyzer for Vue.js 2.

*"Vue verifier"* : Analysis CLI tool for dependency graph.

- Analyze dependency from a page through directory
- Visualize dependency by graph
- Works only Vue.js 2.

## Usage

### Install

```bash
# Global install as CLI tooling
npm i -g vurif
```

### Analysis

```bash
vurif load <vue-file> <components-dir>
# vurif load example/App.vue example
```

Subcommands has only `load` currently. See also `vurif --help`

Vurif output dependency analysis by standard out or visual graph.

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
