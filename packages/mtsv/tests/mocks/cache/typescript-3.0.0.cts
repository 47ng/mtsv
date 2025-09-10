// Minimal mock TypeScript 3.0.0 module for testing
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

// Minimal TypeScript module structure
const typescript = {
  version: '3.0.0',
  ScriptTarget,
  ModuleKind,
  
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
  
  // Minimal compiler API stubs
  createProgram: () => ({
    getSyntacticDiagnostics: () => [],
    getSemanticDiagnostics: () => [],
    getGlobalDiagnostics: () => [],
    getOptionsDiagnostics: () => [],
    getDeclarationDiagnostics: () => []
  }),
  
  createSourceFile: () => ({}),
  parseConfigFileTextToJson: () => ({}),
  parseJsonConfigFileContent: () => ({})
}

// Export using CommonJS format as expected by require()
module.exports = typescript