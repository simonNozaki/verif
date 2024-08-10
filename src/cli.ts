import { defineCommand, runMain as _runMain } from 'citty'
import { commands } from './commands'
import { name, version, description } from '../package.json'

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  subCommands: commands
});

export const runMain = () => _runMain(main)
