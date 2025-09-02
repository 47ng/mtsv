import { mkdir, rmdir, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import type ts from 'typescript'

export type TypeScriptModule = typeof ts

export interface TypeScriptCacheInterface {
  /**
   * Load a specific TypeScript version, from:
   * - In-memory cache (if already loaded)
   * - On-disk cache (if previously fetched)
   * - CDN (unpkg) otherwise
   * @param version
   */
  load(version: string): Promise<TypeScriptModule>

  /**
   * Free the in-memory cache for a specific version
   */
  free(version: string): void

  /**
   * Clear all in-memory cached versions, but keep the files on disk.
   */
  clear(): void

  /**
   * Clear the in-memory cache and remove all cached files from disk.
   */
  purge(): Promise<void>

  get path(): string
}

// --

export class TypeScriptMemoryCache implements TypeScriptCacheInterface {
  readonly memoryCache: Map<string, TypeScriptModule> = new Map()

  constructor(versions: Record<string, TypeScriptModule> = {}) {
    for (const [version, module] of Object.entries(versions)) {
      this.memoryCache.set(version, module)
    }
  }

  async load(version: string): Promise<TypeScriptModule> {
    const fromMemory = this.memoryCache.get(version)
    if (fromMemory) {
      return fromMemory
    }
    throw new Error(`TypeScript version ${version} not in cache`)
  }
  clear(): void {
    this.memoryCache.clear()
  }
  free(version: string): void {
    this.memoryCache.delete(version)
  }
  async purge(): Promise<void> {
    this.clear()
  }
  get path(): string {
    return '(in-memory)'
  }
}

/**
 * A TypeScript version cache that:
 * - Fetches unknown versions from a CDN (unpkg.com)
 * - Stores fetched versions on disk
 * - Caches loaded versions in memory
 */
export class TypeScriptCDNCache implements TypeScriptCacheInterface {
  readonly basePath: string
  readonly require: NodeJS.Require = createRequire(import.meta.url)

  constructor(directory: string = tmpdir()) {
    this.basePath = resolve(directory, 'mtsv-cache')
    // List available cached versions using a glob on this.basePath:
    // readdirSync(this.basePath, { withFileTypes: true }).forEach(dirent => {
    //   if (dirent.isFile() && dirent.name.endsWith('.cjs')) {
    //     // Calculate SHA-256 hash of the file to verify integrity?
    //     const hash = createHash('sha256')
    //     hash.update(dirent.name)
    //     hash.update(readFileSync(resolve(this.basePath, dirent.name)))
    //   }
    // })
  }

  async load(version: string): Promise<TypeScriptModule> {
    const filePath = this.#resolveVersionFile(version)
    let tsModule = this.require.cache[filePath] as TypeScriptModule | undefined
    if (tsModule) {
      return tsModule
    }
    // Check on disk, and fetch from CDN if not present
    if ((await this.#hasOnDisk(filePath)) === false) {
      console.debug(`Fetching TypeScript ${version} from CDN...`)
      const res = await fetch(
        `https://unpkg.com/typescript@${version}/lib/typescript.js`
      )
      if (!res.ok) {
        throw new Error(`Failed to fetch TypeScript ${version}`)
      }
      await this.#ensureDir(filePath)
      await writeFile(filePath, await res.text(), 'utf8')
    }
    tsModule = this.require(filePath) as TypeScriptModule
    return tsModule
  }

  free(version: string): void {
    delete this.require.cache[
      this.require.resolve(this.#resolveVersionFile(version))
    ]
  }

  clear(): void {
    const keysToRemove = Object.keys(this.require.cache).filter(key =>
      key.startsWith(this.basePath)
    )
    for (const key of keysToRemove) {
      delete this.require.cache[key]
    }
  }

  async purge(): Promise<void> {
    // Also remove from disk
    return rmdir(this.basePath, { recursive: true }).catch(() => {})
  }
  get path(): string {
    return this.basePath
  }

  // private --

  #resolveVersionFile(version: string) {
    return resolve(this.basePath, `typescript-${version}.cjs`)
  }

  async #ensureDir(filePath: string): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true }).catch(() => {})
  }

  async #hasOnDisk(filePath: string): Promise<boolean> {
    try {
      const fstat = await stat(filePath).catch(() => null)
      return Boolean(fstat?.isFile())
    } catch {
      return false
    }
  }
}
