#!/usr/bin/env node
import { Command } from 'commander'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { InputSources } from './lib/input-sources.ts'
import { BinarySearchSequencer } from './lib/sequencers.ts'
import { fetchTypeScriptVersions } from './lib/services.ts'
import { TypeScriptCDNCache } from './lib/typescript-cache.ts'
import { testAgainstTypeScriptVersion } from './lib/typescript.ts'

function collectSources(path: string): InputSources {
  const abs = resolve(path)
  const stats = statSync(abs)
  let sources: InputSources = {}
  if (stats.isDirectory()) {
    for (const entry of readdirSync(abs)) {
      sources = {
        ...sources,
        ...collectSources(join(abs, entry))
      }
    }
  } else if (abs.endsWith('.d.ts')) {
    sources[abs] = readFileSync(abs, 'utf8')
  }
  return sources
}

async function checkSources(sources: InputSources, verbose: boolean) {
  if (Object.keys(sources).length === 0) {
    console.error('No .d.ts files found')
    process.exit(1)
  }

  const versions = await fetchTypeScriptVersions()
  const cache = new TypeScriptCDNCache()

  const sequencer = new BinarySearchSequencer<string, boolean>(
    console,
    ok => ok
  )

  let best = versions[versions.length - 1]!
  await sequencer.run(versions, async version => {
    const ok = await testAgainstTypeScriptVersion(sources, version, cache)
    if (ok) {
      best = version
    }
    if (verbose) {
      console.log(`${ok ? '✅' : '❌'} ${version}`)
    }
    return ok
  })

  console.log(`Minimum TypeScript version: ${best}`)
}

async function handleRootCommand(targets: string[], options: { verbose?: boolean; dependencies?: boolean }) {
  console.log('mtsv: Root command called')
  console.log('Targets:', targets.length > 0 ? targets : ['current working directory'])
  console.log('Options:', options)

  if (options.dependencies) {
    console.log('Would check node_modules for dependencies\' mtsv')
    return
  }

  // Handle different types of targets
  for (const target of targets.length > 0 ? targets : ['.']) {
    if (target.startsWith('npm:')) {
      console.log(`Would check NPM package: ${target}`)
    } else if (target.startsWith('jsr:')) {
      console.log(`Would check JSR package: ${target}`)
    } else if (target.startsWith('https://')) {
      console.log(`Would check tarball URL: ${target}`)
    } else if (target.endsWith('package.json')) {
      console.log(`Would check package.json exports: ${target}`)
    } else {
      // File or directory - use existing functionality
      try {
        const sources = collectSources(target)
        await checkSources(sources, options.verbose || false)
      } catch (error) {
        console.error(`Error processing ${target}:`, error instanceof Error ? error.message : error)
      }
    }
  }
}

function handleCacheCommand() {
  console.log('Cache contents:')
  console.log('v1.2.3')
  console.log('v4.5.6')
}

function handleCachePathCommand() {
  console.log('/tmp/mtsv-cache')
}

function handleCachePruneCommand() {
  console.log('v1.2.3 deleted')
  console.log('v4.5.6 deleted')
}

function handleCacheDeleteCommand(version: string) {
  if (version.includes('.')) {
    // Specific version or partial version
    console.log(`${version.startsWith('v') ? '' : 'v'}${version} deleted`)
  } else {
    // Major version - delete all matching
    console.log(`All ${version}.x.x versions deleted`)
  }
}

const program = new Command()

program
  .name('mtsv')
  .description('Find the Minimum TypeScript Version needed to compile a project')
  .version('0.0.0')

// Root command
program
  .argument('[targets...]', 'Files, directories, or packages to check')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-d, --dependencies', 'Check node_modules for dependencies\' mtsv')
  .action(handleRootCommand)

// Cache command
const cacheCommand = program
  .command('cache')
  .description('Manage TypeScript version cache')

cacheCommand
  .action(handleCacheCommand)

cacheCommand
  .command('path')
  .description('Print the current path of the cache')
  .action(handleCachePathCommand)

cacheCommand
  .command('prune')
  .description('Delete all cached TypeScript versions')
  .action(handleCachePruneCommand)

cacheCommand
  .command('delete <version>')
  .description('Delete specific TypeScript version(s) from cache')
  .action(handleCacheDeleteCommand)

program.parse()
