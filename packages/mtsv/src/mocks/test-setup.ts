// src/mocks/test-setup.ts
import {
  createConfigurableHandlers,
  type TypeScriptVersionConfig
} from './configurable-handlers'
import { server } from './node'

/**
 * Configure the global MSW server for testing with specific TypeScript version behavior.
 * This function should be called in test setup to replace the default handlers.
 *
 * @param config - Configuration object defining which versions are available and their behavior
 *
 * @example
 * ```typescript
 * beforeEach(() => {
 *   configureTestServer({
 *     '4.0.0': true,  // This version will pass (no diagnostics errors)
 *     '3.9.0': false  // This version will fail (emit diagnostics errors)
 *   })
 * })
 * ```
 */
export function configureTestServer(config: TypeScriptVersionConfig) {
  const handlers = createConfigurableHandlers(config)
  server.use(...handlers)
}

/**
 * Reset the MSW server to its default handlers.
 * Useful for cleaning up between tests.
 */
export function resetTestServer() {
  server.resetHandlers()
}

/**
 * Utility function to create a simple test config for common scenarios.
 */
export const testConfigs = {
  /**
   * Single passing version - useful for basic cache testing
   */
  singlePass: (version: string = '4.0.0'): TypeScriptVersionConfig => ({
    [version]: true
  }),

  /**
   * Single failing version - useful for error handling testing
   */
  singleFail: (version: string = '3.9.0'): TypeScriptVersionConfig => ({
    [version]: false
  }),

  /**
   * Multiple versions with mixed results - useful for comprehensive testing
   */
  mixed: (): TypeScriptVersionConfig => ({
    '3.9.0': false,
    '4.0.0': true,
    '4.5.0': true,
    '5.0.0': false
  }),

  /**
   * All passing versions - useful for testing successful operations
   */
  allPass: (): TypeScriptVersionConfig => ({
    '4.0.0': true,
    '4.5.0': true,
    '5.0.0': true
  }),

  /**
   * All failing versions - useful for testing error scenarios
   */
  allFail: (): TypeScriptVersionConfig => ({
    '3.9.0': false,
    '4.0.0': false,
    '4.5.0': false
  })
}
