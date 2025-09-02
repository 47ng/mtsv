import {
  createDefaultMapFromCDN,
  createSystem,
  createVirtualTypeScriptEnvironment
} from '@typescript/vfs'
import type { InputSources } from './input-sources'
import type { TypeScriptCacheInterface } from './typescript-cache'

export async function testAgainstTypeScriptVersion(
  sources: InputSources,
  version: string,
  cache: TypeScriptCacheInterface
): Promise<boolean> {
  try {
    const tsModule = await cache.load(version)
    const shouldCache = typeof localStorage !== 'undefined'
    const fsMap = await createDefaultMapFromCDN(
      {
        target: tsModule.ScriptTarget.ES5,
        lib: ['ES5']
      },
      version,
      shouldCache,
      tsModule
    )

    for (const [path, source] of Object.entries(sources)) {
      fsMap.set('/' + path, source)
    }

    const system = createSystem(fsMap)
    const env = createVirtualTypeScriptEnvironment(
      system,
      Object.keys(sources).map(f => '/' + f),
      tsModule
    )
    const program = env.languageService.getProgram()
    if (!program) {
      return false
    }
    const diags = [
      ...program.getSyntacticDiagnostics(),
      ...program.getSemanticDiagnostics(),
      ...program.getGlobalDiagnostics(),
      ...program.getOptionsDiagnostics(),
      ...program.getDeclarationDiagnostics()
    ]
    return diags.length === 0
  } catch (error) {
    console.error(`Error testing version ${version}:`, error)
    return false
  } finally {
    cache.free(version)
  }
}
