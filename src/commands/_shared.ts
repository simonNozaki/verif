import type { ArgDef } from 'citty'

export const sharedArgs: Record<string, ArgDef> = {
  format: {
    type: 'string',
    default: 'graph',
    alias: 'f',
    description: 'Output format: "graph", "stdout", "report". default is "graph"'
  }
} as const
