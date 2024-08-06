import { defineCommand, runMain as _runMain } from 'citty'
import { commands } from './commands'

const main = defineCommand({
  meta: {
    name: 'verif',
    version: '0.0.1',
    description: 'Components dependences analyzer for Vue 2',
  },
  subCommands: commands
});

export const runMain = () => _runMain(main)
