// test/example.test.ts
// @vitest-environment node
import { describe } from 'node:test'
import { expect, it, beforeEach, afterEach } from 'vitest'
import { fetchTypeScriptVersions } from './services'
import { configureTestServer, resetTestServer } from '../mocks/test-setup'

describe('fetchTypeScriptVersions', () => {
  beforeEach(() => {
    // Configure a standard set of versions for services testing
    configureTestServer({
      '4.0.0': true,
      '5.0.0': true
    })
  })

  afterEach(() => {
    resetTestServer()
  })

  it('fetches a list of versions for TypeScript', async () => {
    const versionsPromise = fetchTypeScriptVersions()
    await expect(versionsPromise).resolves.toEqual(['4.0.0', '5.0.0'])
  })

  it('includes dev versions when asked to', async () => {
    const versionsPromise = fetchTypeScriptVersions({ includeDev: true })
    await expect(versionsPromise).resolves.toEqual([
      '4.0.0',
      '5.0.0',
      '5.1.0-dev.20240101'
    ])
  })

  it('includes rc versions when asked to', async () => {
    const versionsPromise = fetchTypeScriptVersions({ includeRc: true })
    await expect(versionsPromise).resolves.toEqual([
      '4.0.0',
      '5.0.0',
      '5.1.0-rc.20240101'
    ])
  })

  it('includes insiders versions when asked to', async () => {
    const versionsPromise = fetchTypeScriptVersions({ includeInsiders: true })
    await expect(versionsPromise).resolves.toEqual([
      '4.0.0',
      '5.0.0',
      '5.1.0-insiders.20240101'
    ])
  })

  it('includes beta versions when asked to', async () => {
    const versionsPromise = fetchTypeScriptVersions({ includeBeta: true })
    await expect(versionsPromise).resolves.toEqual([
      '4.0.0',
      '5.0.0',
      '5.1.0-beta.20240101'
    ])
  })
})
