#!/usr/bin/env node
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

async function main() {
  const args = process.argv.slice(2)
  if (!args.length) {
    console.error('Usage: ts-min-version [--verbose] <fileOrDir> [...]')
    process.exit(1)
  }

  const verbose = args.includes('--verbose')
  const fileArgs = args.filter(a => a !== '--verbose')
  const sources = collectSources(fileArgs[0]!)
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

main().catch(err => {
  console.error(err)
  process.exit(1)
})
