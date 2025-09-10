// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheDir = resolve(__dirname, '../../tests/mocks/cache')

/**
 * Derive available TypeScript versions from the filesystem.
 * This makes the filesystem the source of truth for which versions are available.
 */
function getAvailableVersions(): string[] {
  try {
    const files = readdirSync(cacheDir)
    const versions = files
      .filter(file => file.startsWith('typescript-') && file.endsWith('.cts'))
      .map(file => file.replace('typescript-', '').replace('.cts', ''))
      .sort()
    return versions
  } catch (error) {
    // If cache directory doesn't exist, return empty array
    return []
  }
}

export const handlers = [
  http.get('https://registry.npmjs.org/typescript', () => {
    // Dynamically create versions object from available files
    const availableVersions = getAvailableVersions()
    const versions: Record<string, null> = {}

    // Add the available versions from filesystem
    for (const version of availableVersions) {
      versions[version] = null
    }

    // Add some additional dev/beta versions for realistic npm registry behavior
    versions['5.1.0-dev.20240101'] = null
    versions['5.1.0-insiders.20240101'] = null
    versions['5.1.0-beta.20240101'] = null
    versions['5.1.0-rc.20240101'] = null

    return HttpResponse.json({ versions })
  }),

  // Mock TypeScript CDN requests
  http.get(
    'https://unpkg.com/typescript@:version/lib/typescript.js',
    ({ params }) => {
      const version = params.version as string
      const filePath = resolve(cacheDir, `typescript-${version}.cts`)

      try {
        const content = readFileSync(filePath, 'utf8')
        return new HttpResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=86400'
          }
        })
      } catch (error) {
        // If file doesn't exist, return 404
        return new HttpResponse(`TypeScript version ${version} not found`, {
          status: 404,
          statusText: 'Not Found'
        })
      }
    }
  )
]
