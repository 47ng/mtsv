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
      expect(program.description()).toBe(
        'Find the Minimum TypeScript Version needed to compile a project'
      )
      expect(program.version()).toBe('0.0.0')
    })

    it('should call onTargets with targets and options when root command is executed', async () => {
      const mockActions: RootActions = {
        onTargets: vi.fn().mockResolvedValue(undefined)
      }

      const program = createRootCommand(mockActions)

      // Simulate command execution with targets and options
      await program.parseAsync(
        ['node', 'mtsv', 'file1.d.ts', 'dir/', '--verbose'],
        { from: 'node' }
      )

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

      await program.parseAsync(['node', 'mtsv', '--dependencies'], {
        from: 'node'
      })

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

    // Test the cache command structure by checking if it has the right subcommands
    it('should have the correct subcommands configured', () => {
      const mockActions: CacheActions = {
        onRoot: vi.fn(),
        onPath: vi.fn(),
        onPrune: vi.fn(),
        onDelete: vi.fn()
      }

      const cacheCommand = createCacheCommand(mockActions)
      const subcommands = cacheCommand.commands.map(cmd => cmd.name())

      expect(subcommands).toContain('path')
      expect(subcommands).toContain('prune')
      expect(subcommands).toContain('delete')
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
      await program.parseAsync(['node', 'mtsv', 'test.d.ts', '--verbose'], {
        from: 'node'
      })
      expect(rootActions.onTargets).toHaveBeenCalledWith(
        ['test.d.ts'],
        expect.objectContaining({ verbose: true }),
        expect.any(Object)
      )

      // Reset mocks
      vi.clearAllMocks()

      // Test cache root command
      await program.parseAsync(['node', 'mtsv', 'cache'], { from: 'node' })
      expect(cacheActions.onRoot).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      )

      // Reset mocks
      vi.clearAllMocks()

      // Test cache path command
      await program.parseAsync(['node', 'mtsv', 'cache', 'path'], {
        from: 'node'
      })
      expect(cacheActions.onPath).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      )

      // Reset mocks
      vi.clearAllMocks()

      // Test cache prune command
      await program.parseAsync(['node', 'mtsv', 'cache', 'prune'], {
        from: 'node'
      })
      expect(cacheActions.onPrune).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      )

      // Reset mocks
      vi.clearAllMocks()

      // Test cache delete command
      await program.parseAsync(['node', 'mtsv', 'cache', 'delete', 'v4.5.0'], {
        from: 'node'
      })
      expect(cacheActions.onDelete).toHaveBeenCalledWith(
        'v4.5.0',
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('should correctly handle different argument types', async () => {
      const rootActions: RootActions = {
        onTargets: vi.fn().mockResolvedValue(undefined)
      }

      const program = createRootCommand(rootActions)

      // Test no arguments (defaults to current directory)
      await program.parseAsync(['node', 'mtsv'], { from: 'node' })
      expect(rootActions.onTargets).toHaveBeenCalledWith(
        [],
        expect.objectContaining({}),
        expect.any(Object)
      )

      // Reset mocks
      vi.clearAllMocks()

      // Test multiple targets with different flags
      await program.parseAsync(
        ['node', 'mtsv', 'file1.d.ts', 'dir/', '--dependencies'],
        { from: 'node' }
      )
      expect(rootActions.onTargets).toHaveBeenCalledWith(
        ['file1.d.ts', 'dir/'],
        expect.objectContaining({ dependencies: true }),
        expect.any(Object)
      )
    })
  })
})
