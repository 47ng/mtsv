/**
 * Record<fileName, fileContent>
 */
export type InputSources = Record<string, string>

export function loadInputSourcesFromFile(filePath: string): InputSources {
  return {}
}

export function loadInputSourcesFromDirectory(dirPath: string): InputSources {
  return {}
}

export function loadInputSourcesFromLocalPackageJson(
  packageJsonPath: string
): InputSources {
  return {}
}

export function loadInputSourcesFromNpmPackage(
  packageName: string,
  version: string
): InputSources {
  return {}
}
