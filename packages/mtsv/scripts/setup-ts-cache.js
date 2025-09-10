#!/usr/bin/env node

/**
 * Download TypeScript packages for testing and store them in the test cache directory.
 * This script downloads the versions that match those returned by the mock NPM registry.
 */

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheDir = resolve(__dirname, '../tests/mocks/cache')

// These versions match what's returned by the mock NPM registry in handlers.ts
const versions = ['3.0.0', '4.0.0', '5.0.0']

async function downloadTypeScriptVersion(version) {
  console.log(`Downloading TypeScript ${version}...`)
  
  const url = `https://unpkg.com/typescript@${version}/lib/typescript.js`
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch TypeScript ${version}: ${response.status} ${response.statusText}`)
  }
  
  const content = await response.text()
  
  // Ensure cache directory exists
  mkdirSync(cacheDir, { recursive: true })
  
  // Write as .cts file to match the pattern expected by TypeScriptCDNCache
  const filePath = resolve(cacheDir, `typescript-${version}.cts`)
  writeFileSync(filePath, content, 'utf8')
  
  console.log(`✓ Downloaded TypeScript ${version} to ${filePath}`)
}

async function main() {
  console.log('Setting up TypeScript cache for testing...')
  console.log(`Cache directory: ${cacheDir}`)
  
  for (const version of versions) {
    const filePath = resolve(cacheDir, `typescript-${version}.cts`)
    if (existsSync(filePath)) {
      console.log(`✓ TypeScript ${version} already cached`)
      continue
    }
    
    try {
      await downloadTypeScriptVersion(version)
    } catch (error) {
      console.error(`✗ Failed to download TypeScript ${version}:`, error.message)
      process.exit(1)
    }
  }
  
  console.log('✓ TypeScript cache setup complete!')
}

main().catch(error => {
  console.error('Error setting up TypeScript cache:', error)
  process.exit(1)
})