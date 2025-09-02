// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

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
  })
]
