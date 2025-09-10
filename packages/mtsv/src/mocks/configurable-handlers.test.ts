// src/mocks/configurable-handlers.test.ts
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { configureTestServer, resetTestServer, testConfigs } from './test-setup'
import { TypeScriptCDNCache } from '../lib/typescript-cache'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

describe('Configurable TypeScript Handlers', () => {
  let tempDir: string
  let cache: TypeScriptCDNCache
  
  beforeEach(() => {
    tempDir = mkdtempSync(resolve(tmpdir(), 'mtsv-configurable-test-'))
    cache = new TypeScriptCDNCache(tempDir)
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
    resetTestServer() // Reset to default handlers after each test
  })

  describe('single passing version', () => {
    it('should load a passing TypeScript version successfully', async () => {
      configureTestServer(testConfigs.singlePass('4.0.0'))
      
      const tsModule = await cache.load('4.0.0')
      
      expect(tsModule).toBeDefined()
      expect(tsModule.version).toBe('4.0.0')
      expect(tsModule.ScriptTarget).toBeDefined()
      
      // Verify it's configured to pass (no diagnostics errors)
      const program = tsModule.createProgram()
      expect(program.getSyntacticDiagnostics()).toEqual([])
      expect(program.getSemanticDiagnostics()).toEqual([])
    })

    it('should return 404 for non-configured versions', async () => {
      configureTestServer(testConfigs.singlePass('4.0.0'))
      
      await expect(cache.load('99.0.0')).rejects.toThrow(
        'Failed to fetch TypeScript 99.0.0'
      )
    })
  })

  describe('single failing version', () => {
    it('should load a failing TypeScript version with diagnostics', async () => {
      configureTestServer(testConfigs.singleFail('3.9.0'))
      
      const tsModule = await cache.load('3.9.0')
      
      expect(tsModule).toBeDefined()
      expect(tsModule.version).toBe('3.9.0')
      
      // Verify it's configured to fail (has diagnostics errors)
      const program = tsModule.createProgram()
      const diagnostics = program.getSyntacticDiagnostics()
      expect(diagnostics).toHaveLength(1)
      expect(diagnostics[0]).toMatchObject({
        category: 1, // Error
        code: 2345
      })
    })
  })

  describe('mixed configuration', () => {
    it('should handle passing and failing versions correctly', async () => {
      configureTestServer(testConfigs.mixed())
      
      // Test a passing version
      const passingTs = await cache.load('4.0.0')
      expect(passingTs.version).toBe('4.0.0')
      expect(passingTs.createProgram().getSyntacticDiagnostics()).toEqual([])
      
      // Test a failing version  
      const failingTs = await cache.load('3.9.0')
      expect(failingTs.version).toBe('3.9.0')
      expect(failingTs.createProgram().getSyntacticDiagnostics()).toHaveLength(1)
    })
  })
})