import { Command } from 'commander'
import type { CacheActions, RootActions } from './cli-actions.js'

/**
 * Creates the root command with the provided actions
 */
export function createRootCommand(actions: RootActions): Command {
  const program = new Command()

  program
    .name('mtsv')
    .description(
      'Find the Minimum TypeScript Version needed to compile a project'
    )
    .version('0.0.0')

  // Root command
  program
    .argument('[targets...]', 'Files, directories, or packages to check')
    .option('-v, --verbose', 'Enable verbose output')
    .option('-d, --dependencies', "Check node_modules for dependencies' mtsv")
    .action(actions.onTargets)

  return program
}

/**
 * Creates the cache command with the provided actions
 */
export function createCacheCommand(actions: CacheActions): Command {
  const cacheCommand = new Command('cache').description(
    'Manage TypeScript version cache'
  )

  cacheCommand.action(actions.onRoot)

  cacheCommand
    .command('path')
    .description('Print the current path of the cache')
    .action(actions.onPath)

  cacheCommand
    .command('prune')
    .description('Delete all cached TypeScript versions')
    .action(actions.onPrune)

  cacheCommand
    .command('delete <version>')
    .description('Delete specific TypeScript version(s) from cache')
    .action(actions.onDelete)

  return cacheCommand
}
