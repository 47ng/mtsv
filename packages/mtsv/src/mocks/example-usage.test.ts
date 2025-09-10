// src/mocks/example-usage.test.ts
// Example demonstrating the flexibility of per-test TypeScript mock configuration

import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { configureTestServer, resetTestServer } from './test-setup'
import { TypeScriptCDNCache } from '../lib/typescript-cache'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

describe('Per-Test TypeScript Mock Configuration Examples', () => {
  let tempDir: string
  let cache: TypeScriptCDNCache

  beforeEach(() => {
    tempDir = mkdtempSync(resolve(tmpdir(), 'mtsv-example-test-'))
    cache = new TypeScriptCDNCache(tempDir)
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
    resetTestServer()
  })

  it('should test a scenario where newer TS versions work but older ones fail', async () => {
    // Configure test: newer versions pass, older versions fail
    configureTestServer({
      '3.9.0': false, // Too old, fails with diagnostics
      '4.0.0': true, // Works fine
      '4.5.0': true, // Works fine
      '5.0.0': true // Latest, works fine
    })

    // Test that newer versions work
    const ts5 = await cache.load('5.0.0')
    expect(ts5.version).toBe('5.0.0')
    expect(ts5.createProgram().getSyntacticDiagnostics()).toEqual([])

    const ts4 = await cache.load('4.0.0')
    expect(ts4.version).toBe('4.0.0')
    expect(ts4.createProgram().getSyntacticDiagnostics()).toEqual([])

    // Test that older version fails
    const ts39 = await cache.load('3.9.0')
    expect(ts39.version).toBe('3.9.0')
    expect(ts39.createProgram().getSyntacticDiagnostics()).toHaveLength(1)
  })

  it('should test a breaking change scenario where specific versions fail', async () => {
    // Configure test: simulate a breaking change in 4.5.0
    configureTestServer({
      '4.0.0': true, // Pre-breaking change, works
      '4.4.0': true, // Pre-breaking change, works
      '4.5.0': false, // Breaking change introduced, fails
      '4.6.0': false, // Still broken
      '4.7.0': true, // Fixed in this version
      '5.0.0': true // Latest, works
    })

    // Test versions before breaking change
    const ts44 = await cache.load('4.4.0')
    expect(ts44.createProgram().getSyntacticDiagnostics()).toEqual([])

    // Test breaking change version
    const ts45 = await cache.load('4.5.0')
    expect(ts45.createProgram().getSyntacticDiagnostics()).toHaveLength(1)

    // Test fixed version
    const ts47 = await cache.load('4.7.0')
    expect(ts47.createProgram().getSyntacticDiagnostics()).toEqual([])
  })

  it('should test minimum version detection scenario', async () => {
    // Configure test: simulate finding minimum working version
    configureTestServer({
      '3.8.0': false, // Too old
      '3.9.0': false, // Still too old
      '4.0.0': true, // Minimum working version!
      '4.1.0': true, // Also works
      '4.2.0': true // Also works
    })

    // Test that we can identify the minimum working version
    const results = []
    for (const version of ['3.8.0', '3.9.0', '4.0.0', '4.1.0']) {
      const ts = await cache.load(version)
      const diagnostics = ts.createProgram().getSyntacticDiagnostics()
      results.push({
        version,
        hasErrors: diagnostics.length > 0
      })
    }

    expect(results).toEqual([
      { version: '3.8.0', hasErrors: true },
      { version: '3.9.0', hasErrors: true },
      { version: '4.0.0', hasErrors: false }, // First working version
      { version: '4.1.0', hasErrors: false }
    ])
  })

  it('should test edge case with no working versions', async () => {
    // Configure test: all versions fail (edge case)
    configureTestServer({
      '4.0.0': false,
      '4.5.0': false,
      '5.0.0': false
    })

    // All versions should emit diagnostics
    for (const version of ['4.0.0', '4.5.0', '5.0.0']) {
      const ts = await cache.load(version)
      expect(ts.createProgram().getSyntacticDiagnostics()).toHaveLength(1)
    }
  })
})
