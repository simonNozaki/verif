# verif

Component dependency Analyzer for Vue.js 2.

## Usage

```bash
./bin/verif load example/App.vue example
```

Verif output dependency analysis by standard out or visual graph.

![graph](./docs/graph-image.png)

```
> ./bin/verif --help
Components dependences analyzer for Vue 2 (verif v0.0.1)                                                                                                                                                                                                                        9:09:46

USAGE verif load

COMMANDS

  load    Load dependency graph from a single Vue file source.

Use verif <command> --help for more information about a command.
```

### Options

Available option sets:

|#|parameters|values|
| ---- | ---- | ---- |
|1| `format` | `stdout` , `graph` . Default: `graph` |

## Development

- Requirements: Node.js >=18
- Enable corepack: `corepack enable`
- Install dependencies: `pnpm install`
- Build: `pnpm build`
