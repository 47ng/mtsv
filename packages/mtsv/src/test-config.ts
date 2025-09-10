/**
 * Centralized configuration for TypeScript versions used in testing.
 * 
 * This file serves as the single source of truth for which TypeScript versions
 * we test against. The filesystem (test cache) should contain mock packages for
 * these versions, and the MSW handlers will derive available versions from
 * what's actually present in the filesystem.
 */
export const TYPESCRIPT_TEST_VERSIONS = [
  '3.0.0',
  '4.0.0', 
  '5.0.0'
] as const

export type TypeScriptTestVersion = typeof TYPESCRIPT_TEST_VERSIONS[number]