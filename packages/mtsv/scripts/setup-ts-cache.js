#!/usr/bin/env node

/**
 * Create minimal TypeScript mock packages for testing.
 * This script creates minimal TypeScript modules that provide the essential
 * structure needed by the cache system without requiring network access.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheDir = resolve(__dirname, '../tests/mocks/cache')

// Import the centralized version configuration
// Use relative path since this runs after build
const versions = ['3.0.0', '4.0.0', '5.0.0'] // Temporarily hardcode to avoid import issues

function createMinimalTypeScriptMock(version) {
  return `// Minimal mock TypeScript ${version} module for testing
// This provides the essential TypeScript module structure needed by the cache system

const ScriptTarget = {
  ES3: 0,
  ES5: 1,
  ES2015: 2,
  ES2016: 3,
  ES2017: 4,
  ES2018: 5,
  ES2019: 6,
  ES2020: 7,
  ES2021: 8,
  ES2022: 9,
  ESNext: 99,
  JSON: 100,
  Latest: 99
}

const ModuleKind = {
  None: 0,
  CommonJS: 1,
  AMD: 2,
  UMD: 3,
  System: 4,
  ES2015: 5,
  ES2020: 6,
  ES2022: 7,
  ESNext: 99,
  Node16: 100,
  NodeNext: 199
}

// Minimal TypeScript module structure
const typescript = {
  version: '${version}',
  ScriptTarget,
  ModuleKind,
  
  // Add other essential properties that might be needed
  sys: {
    createDirectory: () => {},
    directoryExists: () => true,
    fileExists: () => true,
    getCurrentDirectory: () => process.cwd(),
    readDirectory: () => [],
    readFile: () => '',
    writeFile: () => {}
  },
  
  // Minimal compiler API stubs
  createProgram: () => ({
    getSyntacticDiagnostics: () => [],
    getSemanticDiagnostics: () => [],
    getGlobalDiagnostics: () => [],
    getOptionsDiagnostics: () => [],
    getDeclarationDiagnostics: () => []
  }),
  
  createSourceFile: () => ({}),
  parseConfigFileTextToJson: () => ({}),
  parseJsonConfigFileContent: () => ({})
}

// Export using CommonJS format as expected by require()
module.exports = typescript`
}

function createTypeScriptMock(version) {
  console.log(`Creating TypeScript ${version} mock...`)
  
  const content = createMinimalTypeScriptMock(version)
  
  // Ensure cache directory exists
  mkdirSync(cacheDir, { recursive: true })
  
  // Write as .cts file to match the pattern expected by TypeScriptCDNCache
  const filePath = resolve(cacheDir, `typescript-${version}.cts`)
  writeFileSync(filePath, content, 'utf8')
  
  console.log(`✓ Created TypeScript ${version} mock at ${filePath}`)
}

async function main() {
  console.log('Setting up TypeScript mocks for testing...')
  console.log(`Cache directory: ${cacheDir}`)
  
  for (const version of versions) {
    const filePath = resolve(cacheDir, `typescript-${version}.cts`)
    if (existsSync(filePath)) {
      console.log(`✓ TypeScript ${version} mock already exists`)
      continue
    }
    
    try {
      createTypeScriptMock(version)
    } catch (error) {
      console.error(`✗ Failed to create TypeScript ${version} mock:`, error.message)
      process.exit(1)
    }
  }
  
  console.log('✓ TypeScript mocks setup complete!')
}

main().catch(error => {
  console.error('Error setting up TypeScript mocks:', error)
  process.exit(1)
})