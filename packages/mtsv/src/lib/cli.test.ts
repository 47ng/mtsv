import { describe, expect, it, vi } from 'vitest'
import { Command } from 'commander'
import type { CacheActions, RootActions } from './cli-actions.js'
import { createCacheCommand, createRootCommand } from './cli-factories.js'

describe('CLI Actions and Factories', () => {
  describe('createRootCommand', () => {
    it('should create a root command with correct configuration', () => {
      const mockActions: RootActions = {
        onTargets: vi.fn()
      }

      const program = createRootCommand(mockActions)

      expect(program.name()).toBe('mtsv')
      expect(program.description()).toBe('Find the Minimum TypeScript Version needed to compile a project')
      expect(program.version()).toBe('0.0.0')
    })

    it('should call onTargets with targets and options when root command is executed', async () => {
      const mockActions: RootActions = {
        onTargets: vi.fn().mockResolvedValue(undefined)
      }

      const program = createRootCommand(mockActions)

      // Simulate command execution with targets and options
      await program.parseAsync(['node', 'mtsv', 'file1.d.ts', 'dir/', '--verbose'], { from: 'node' })

      expect(mockActions.onTargets).toHaveBeenCalledWith(
        ['file1.d.ts', 'dir/'],
        expect.objectContaining({ verbose: true }),
        expect.any(Object) // Command instance
      )
    })

    it('should call onTargets with empty targets when no arguments provided', async () => {
      const mockActions: RootActions = {
        onTargets: vi.fn().mockResolvedValue(undefined)
      }

      const program = createRootCommand(mockActions)

      await program.parseAsync(['node', 'mtsv'], { from: 'node' })

      expect(mockActions.onTargets).toHaveBeenCalledWith(
        [],
        expect.objectContaining({}),
        expect.any(Object) // Command instance
      )
    })

    it('should call onTargets with dependencies option when --dependencies flag is provided', async () => {
      const mockActions: RootActions = {
        onTargets: vi.fn().mockResolvedValue(undefined)
      }

      const program = createRootCommand(mockActions)

      await program.parseAsync(['node', 'mtsv', '--dependencies'], { from: 'node' })

      expect(mockActions.onTargets).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ dependencies: true }),
        expect.any(Object) // Command instance
      )
    })
  })

  describe('createCacheCommand', () => {
    it('should create a cache command with correct configuration', () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn(),
        onPath: vi.fn(),
        onPrune: vi.fn(),
        onDelete: vi.fn()
      }

      const cacheCommand = createCacheCommand(mockActions)

      expect(cacheCommand.name()).toBe('cache')
      expect(cacheCommand.description()).toBe('Manage TypeScript version cache')
    })

    it('should call onRoot when cache command is executed without subcommand', async () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn().mockResolvedValue(undefined),
        onPath: vi.fn(),
        onPrune: vi.fn(),
        onDelete: vi.fn()
      }

      // Create a parent command to properly test cache subcommand
      const program = new Command('test')
      const cacheCommand = createCacheCommand(mockActions)
      program.addCommand(cacheCommand)

      await program.parseAsync(['test', 'cache'], { from: 'node' })

      expect(mockActions.onRoot).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
    })

    it('should call onPath when cache path subcommand is executed', async () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn(),
        onPath: vi.fn().mockResolvedValue(undefined),
        onPrune: vi.fn(),
        onDelete: vi.fn()
      }

      // Create a parent command to properly test cache subcommand
      const program = new Command('test')
      const cacheCommand = createCacheCommand(mockActions)
      program.addCommand(cacheCommand)

      await program.parseAsync(['test', 'cache', 'path'], { from: 'node' })

      expect(mockActions.onPath).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
    })

    it('should call onPrune when cache prune subcommand is executed', async () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn(),
        onPath: vi.fn(),
        onPrune: vi.fn().mockResolvedValue(undefined),
        onDelete: vi.fn()
      }

      // Create a parent command to properly test cache subcommand
      const program = new Command('test')
      const cacheCommand = createCacheCommand(mockActions)
      program.addCommand(cacheCommand)

      await program.parseAsync(['test', 'cache', 'prune'], { from: 'node' })

      expect(mockActions.onPrune).toHaveBeenCalledWith(expect.any(Object), expect.any(Object))
    })

    it('should call onDelete with version when cache delete subcommand is executed', async () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn(),
        onPath: vi.fn(),
        onPrune: vi.fn(),
        onDelete: vi.fn().mockResolvedValue(undefined)
      }

      // Create a parent command to properly test cache subcommand
      const program = new Command('test')
      const cacheCommand = createCacheCommand(mockActions)
      program.addCommand(cacheCommand)

      await program.parseAsync(['test', 'cache', 'delete', '5.0.0'], { from: 'node' })

      expect(mockActions.onDelete).toHaveBeenCalledWith('5.0.0', expect.any(Object), expect.any(Object))
    })

    it('should call onDelete with major version when deleting major version', async () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn(),
        onPath: vi.fn(),
        onPrune: vi.fn(),
        onDelete: vi.fn().mockResolvedValue(undefined)
      }

      // Create a parent command to properly test cache subcommand
      const program = new Command('test')
      const cacheCommand = createCacheCommand(mockActions)
      program.addCommand(cacheCommand)

      await program.parseAsync(['test', 'cache', 'delete', '5'], { from: 'node' })

      expect(mockActions.onDelete).toHaveBeenCalledWith('5', expect.any(Object), expect.any(Object))
    })
  })

  describe('Full CLI Integration', () => {
    it('should integrate root and cache commands correctly', async () => {
      const rootActions: RootActions = {
        onTargets: vi.fn().mockResolvedValue(undefined)
      }

      const cacheActions: CacheActions = {
        onRoot: vi.fn().mockResolvedValue(undefined),
        onPath: vi.fn().mockResolvedValue(undefined),
        onPrune: vi.fn().mockResolvedValue(undefined),
        onDelete: vi.fn().mockResolvedValue(undefined)
      }

      const program = createRootCommand(rootActions)
      const cacheCommand = createCacheCommand(cacheActions)
      program.addCommand(cacheCommand)

      // Test root command
      await program.parseAsync(['node', 'mtsv', 'test.d.ts', '--verbose'], { from: 'node' })
      expect(rootActions.onTargets).toHaveBeenCalledWith(
        ['test.d.ts'],
        expect.objectContaining({ verbose: true }),
        expect.any(Object)
      )

      // Reset mocks
      vi.clearAllMocks()

      // Test cache command
      await program.parseAsync(['node', 'mtsv', 'cache', 'delete', 'v4.5.0'], { from: 'node' })
      expect(cacheActions.onDelete).toHaveBeenCalledWith('v4.5.0', expect.any(Object), expect.any(Object))
    })
  })
})