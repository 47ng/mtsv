// src/mocks/handlers.ts
// Re-export configurable functionality for backward compatibility
// The default handlers are empty since tests should configure their own mocks per-test

export {
  createConfigurableHandlers,
  type TypeScriptVersionConfig
} from './configurable-handlers'
export { configureTestServer, resetTestServer, testConfigs } from './test-setup'

// Empty default handlers - tests should use configureTestServer() instead
export const handlers: never[] = []
