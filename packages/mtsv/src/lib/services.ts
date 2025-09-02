import semver from 'semver'
import { z } from 'zod'

export type FetchTypeScriptVersionsOptions = {
  includeDev?: boolean
  includeInsiders?: boolean
  includeBeta?: boolean
  includeRc?: boolean
  minVersion?: string
  maxVersion?: string
}

export async function fetchTypeScriptVersions({
  includeDev = false,
  includeInsiders = false,
  includeBeta = false,
  includeRc = false,
  minVersion = '4.0.0',
  maxVersion
}: FetchTypeScriptVersionsOptions = {}): Promise<string[]> {
  const packageMetadataSchema = z.object({
    versions: z.record(z.string(), z.any())
  })
  const response = await fetch('https://registry.npmjs.org/typescript')
  if (!response.ok) {
    throw new Error(
      `Failed to fetch TypeScript versions: ${response.status} ${response.statusText}`
    )
  }
  const packageMetadata = packageMetadataSchema.parse(await response.json())
  const versions = Object.keys(packageMetadata.versions)
    .filter(v => {
      if (!semver.gte(v, minVersion)) {
        return false
      }
      if (maxVersion && !semver.lte(v, maxVersion)) {
        return false
      }
      if (!includeDev && v.includes('dev')) {
        return false
      }
      if (!includeInsiders && v.includes('insiders')) {
        return false
      }
      if (!includeBeta && v.includes('beta')) {
        return false
      }
      if (!includeRc && v.includes('rc')) {
        return false
      }
      return true
    })
    .sort(semver.compare)
  return versions
}
