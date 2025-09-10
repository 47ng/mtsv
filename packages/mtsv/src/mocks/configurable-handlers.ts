// src/mocks/configurable-handlers.ts
import { http, HttpResponse } from 'msw'

/**
 * Configuration for per-test TypeScript version mocking.
 * Key: version number (e.g., '4.0.0')
 * Value: boolean indicating whether the version should pass (true) or fail (false)
 */
export type TypeScriptVersionConfig = Record<string, boolean>

/**
 * Generate a minimal TypeScript module mock that either passes or fails compilation.
 *
 * @param version - The TypeScript version to mock
 * @param shouldPass - Whether this version should pass (true) or emit diagnostics (false)
 */
function generateTypeScriptMock(version: string, shouldPass: boolean): string {
  const diagnostics = shouldPass
    ? '[]'
    : `[{
        category: 1, // Error
        code: 2345,
        messageText: 'Argument of type "string" is not assignable to parameter of type "number"',
        file: undefined,
        start: undefined,
        length: undefined
      }]`

  return `// Dynamic TypeScript ${version} mock for testing (${shouldPass ? 'PASS' : 'FAIL'})
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

const DiagnosticCategory = {
  Warning: 0,
  Error: 1,
  Suggestion: 2,
  Message: 3
}

// Minimal TypeScript module structure
const typescript = {
  version: '${version}',
  ScriptTarget,
  ModuleKind,
  DiagnosticCategory,
  
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
  
  // Configurable compiler API that returns appropriate diagnostics
  createProgram: () => ({
    getSyntacticDiagnostics: () => ${diagnostics},
    getSemanticDiagnostics: () => ${diagnostics},
    getGlobalDiagnostics: () => [],
    getOptionsDiagnostics: () => [],
    getDeclarationDiagnostics: () => ${diagnostics}
  }),
  
  createSourceFile: () => ({}),
  parseConfigFileTextToJson: () => ({}),
  parseJsonConfigFileContent: () => ({})
}

// Export using CommonJS format as expected by require()
module.exports = typescript`
}

/**
 * Create MSW handlers configured for a specific test case.
 *
 * @param config - Configuration object where keys are version numbers and values indicate pass/fail
 * @returns Array of MSW handlers for this test configuration
 */
export function createConfigurableHandlers(config: TypeScriptVersionConfig) {
  const availableVersions = Object.keys(config)

  return [
    // Mock NPM registry to return only the versions defined in this test config
    http.get('https://registry.npmjs.org/typescript', () => {
      const versions: Record<string, null> = {}

      // Add the available versions from test config
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

    // Mock TypeScript CDN requests with dynamic mock generation
    http.get(
      'https://unpkg.com/typescript@:version/lib/typescript.js',
      ({ params }) => {
        const version = params.version as string
        const shouldPass = config[version]

        // If version is not in our config, return 404
        if (shouldPass === undefined) {
          return new HttpResponse(`TypeScript version ${version} not found`, {
            status: 404,
            statusText: 'Not Found'
          })
        }

        // Generate mock content based on test configuration
        const content = generateTypeScriptMock(version, shouldPass)

        return new HttpResponse(content, {
          status: 200,
          headers: {
            'Content-Type': 'application/javascript'
          }
        })
      }
    )
  ]
}

/**
 * Type guard to ensure a test config is valid.
 */
export function isValidVersionConfig(
  config: unknown
): config is TypeScriptVersionConfig {
  if (typeof config !== 'object' || config === null) {
    return false
  }

  return Object.entries(config).every(([key, value]) => {
    return typeof key === 'string' && typeof value === 'boolean'
  })
}
