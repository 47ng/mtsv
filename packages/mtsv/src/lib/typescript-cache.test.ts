// @vitest-environment node
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import {
  TypeScriptCDNCache,
  TypeScriptMemoryCache,
  type TypeScriptCacheInterface
} from './typescript-cache'
import {
  configureTestServer,
  resetTestServer,
  testConfigs
} from '../mocks/test-setup'

describe('TypeScript Cache Classes', () => {
  describe('TypeScriptMemoryCache', () => {
    let cache: TypeScriptMemoryCache

    beforeEach(() => {
      cache = new TypeScriptMemoryCache()
    })

    it('should create an empty cache', () => {
      expect(cache.memoryCache.size).toBe(0)
      expect(cache.path).toBe('(in-memory)')
    })

    it('should throw error for unknown versions', async () => {
      await expect(cache.load('4.0.0')).rejects.toThrow(
        'TypeScript version 4.0.0 not in cache'
      )
    })

    it('should clear the cache', () => {
      // Add a mock module to the cache
      const mockModule = { version: '4.0.0' } as any
      cache.memoryCache.set('4.0.0', mockModule)

      expect(cache.memoryCache.size).toBe(1)
      cache.clear()
      expect(cache.memoryCache.size).toBe(0)
    })

    it('should free specific versions', () => {
      const mockModule = { version: '4.0.0' } as any
      cache.memoryCache.set('4.0.0', mockModule)

      expect(cache.memoryCache.has('4.0.0')).toBe(true)
      cache.free('4.0.0')
      expect(cache.memoryCache.has('4.0.0')).toBe(false)
    })

    it('should purge the cache', async () => {
      const mockModule = { version: '4.0.0' } as any
      cache.memoryCache.set('4.0.0', mockModule)

      expect(cache.memoryCache.size).toBe(1)
      await cache.purge()
      expect(cache.memoryCache.size).toBe(0)
    })
  })

  describe('TypeScriptCDNCache', () => {
    let cache: TypeScriptCDNCache
    let tempDir: string

    beforeEach(() => {
      tempDir = mkdtempSync(resolve(tmpdir(), 'mtsv-test-'))
      cache = new TypeScriptCDNCache(tempDir)
    })

    afterEach(() => {
      // Clean up temp directory
      rmSync(tempDir, { recursive: true, force: true })
      resetTestServer() // Reset to default handlers after each test
    })

    it('should create cache with correct path', () => {
      expect(cache.path).toBe(resolve(tempDir, 'mtsv-cache'))
    })

    it('should load TypeScript version from CDN (mocked)', async () => {
      // Configure test to provide a passing TypeScript 4.0.0 version
      configureTestServer(testConfigs.singlePass('4.0.0'))

      const tsModule = await cache.load('4.0.0')

      expect(tsModule).toBeDefined()
      expect(tsModule.version).toBe('4.0.0')
      expect(tsModule.ScriptTarget).toBeDefined()
    })

    it('should throw error for non-existent versions', async () => {
      // Configure test with only 4.0.0 available
      configureTestServer(testConfigs.singlePass('4.0.0'))

      await expect(cache.load('99.0.0')).rejects.toThrow(
        'Failed to fetch TypeScript 99.0.0'
      )
    })

    it('should cache loaded modules in memory', async () => {
      // Configure test to provide TypeScript 4.0.0
      configureTestServer(testConfigs.singlePass('4.0.0'))

      // Load the same version twice
      const tsModule1 = await cache.load('4.0.0')
      const tsModule2 = await cache.load('4.0.0')

      // Both should be valid TypeScript modules
      expect(tsModule1).toBeDefined()
      expect(tsModule2).toBeDefined()
      expect(tsModule1.version).toBe('4.0.0')
      expect(tsModule2.version).toBe('4.0.0')
      expect(tsModule1.ScriptTarget).toEqual(tsModule2.ScriptTarget)
    })

    it('should free cached modules', async () => {
      // Configure test to provide TypeScript 4.0.0
      configureTestServer(testConfigs.singlePass('4.0.0'))

      const tsModule1 = await cache.load('4.0.0')
      cache.free('4.0.0')

      // Loading again should still work (from disk cache since mocked)
      const tsModule2 = await cache.load('4.0.0')
      expect(tsModule1.version).toBe('4.0.0')
      expect(tsModule2.version).toBe('4.0.0')
    })

    it('should clear all cached modules', async () => {
      // Configure test to provide multiple TypeScript versions
      configureTestServer({
        '4.0.0': true,
        '5.0.0': true
      })

      await cache.load('4.0.0')
      await cache.load('5.0.0')

      // Clear should remove from memory but files should still exist
      cache.clear()

      // Loading again should work (from disk)
      const tsModule = await cache.load('4.0.0')
      expect(tsModule).toBeDefined()
    })

    it('should purge cache directory', async () => {
      // Configure test to provide TypeScript 4.0.0
      configureTestServer(testConfigs.singlePass('4.0.0'))

      await cache.load('4.0.0')

      // Purge should remove everything
      await cache.purge()

      // Loading again should fetch from CDN
      const tsModule = await cache.load('4.0.0')
      expect(tsModule).toBeDefined()
    })
  })

  describe('Cache Interface Compliance', () => {
    const testCacheInterface = (
      createCache: () => TypeScriptCacheInterface
    ) => {
      let cache: TypeScriptCacheInterface

      beforeEach(() => {
        cache = createCache()
      })

      it('should have all required methods', () => {
        expect(typeof cache.load).toBe('function')
        expect(typeof cache.free).toBe('function')
        expect(typeof cache.clear).toBe('function')
        expect(typeof cache.purge).toBe('function')
        expect(typeof cache.path).toBe('string')
      })
    }

    describe('TypeScriptMemoryCache interface compliance', () => {
      testCacheInterface(() => new TypeScriptMemoryCache())
    })

    describe('TypeScriptCDNCache interface compliance', () => {
      let tempDir: string

      beforeEach(() => {
        tempDir = mkdtempSync(resolve(tmpdir(), 'mtsv-test-'))
      })

      afterEach(() => {
        rmSync(tempDir, { recursive: true, force: true })
        resetTestServer() // Reset handlers after each test
      })

      testCacheInterface(() => new TypeScriptCDNCache(tempDir))
    })
  })
})
