// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cacheDir = resolve(__dirname, '../../tests/mocks/cache')

export const handlers = [
  http.get('https://registry.npmjs.org/typescript', () => {
    return HttpResponse.json({
      versions: {
        '3.0.0': null,
        '4.0.0': null, // We don't care about the values, only the keys
        '5.0.0': null,
        '5.1.0-dev.20240101': null,
        '5.1.0-insiders.20240101': null,
        '5.1.0-beta.20240101': null,
        '5.1.0-rc.20240101': null
      }
    })
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
