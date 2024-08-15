import type { ArgDef } from 'citty'

export const sharedArgs: Record<string, ArgDef> = {
  format: {
    type: 'string',
    default: 'graph',
    alias: 'f',
    description: 'Output format. "graph" or "stdout", default is "graph"'
  }
} as const
