/**
 * Action interfaces for CLI commands
 * These define the handlers that will be called for different CLI operations
 */

import type { Command } from 'commander'

export interface RootActions {
  onTargets(
    targets: string[],
    options: { verbose?: boolean; dependencies?: boolean },
    command: Command
  ): Promise<void>
}

export interface CacheActions {
  onRoot(options: object, command: Command): Promise<void>
  onPath(options: object, command: Command): Promise<void>
  onPrune(options: object, command: Command): Promise<void>
  onDelete(version: string, options: object, command: Command): Promise<void>
}
