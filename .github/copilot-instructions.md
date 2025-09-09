# mtsv - Minimum TypeScript Version Finder

**ALWAYS follow these instructions first.** Only fallback to additional search and context gathering if the information here is incomplete or found to be in error.

## Project Overview

mtsv is a CLI tool that finds the minimum TypeScript version needed to compile a project by testing .d.ts files against different TypeScript versions. It's built as a TypeScript monorepo using pnpm workspaces and Turbo build system.

## Working Effectively

### Prerequisites
- **Node.js**: Use the version specified in `.node-version`
- **Package Manager**: Use pnpm (version specified in `package.json` packageManager field)

Install pnpm if not available:
```bash
npm install -g pnpm
```

### Repository Setup and Build Process

Bootstrap the repository:
```bash
pnpm install  # Takes ~18 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
```

Build the project:
```bash
pnpm run build  # Takes ~4 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
```

The build creates two main outputs in `packages/mtsv/dist/`:
- `index.js` + `index.d.ts`: Library exports  
- `cli.js`: Executable CLI tool

### Testing

Run all tests (preferred):
```bash
pnpm run test  # Takes ~3 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
```

### Linting

Run all linting:
```bash
pnpm run lint  # Takes ~1 second. NEVER CANCEL. Set timeout to 30+ seconds.
```

This runs:
- `prettier --check` for code formatting
- `sherif` for dependency validation

**ALWAYS run linting before committing changes** to ensure CI passes.

### Development Workflow

Start development with watch mode:
```bash
pnpm run dev --filter mtsv  # Runs tsdown in watch mode. NEVER CANCEL.
```

This rebuilds automatically when source files change.

## CLI Usage and Validation

### Running the CLI

After building, test the CLI:
```bash
./packages/mtsv/dist/cli.js tests/5.0.0.d.ts  # Basic test with included test file
```

**NETWORK DEPENDENCY**: The CLI requires internet access to fetch TypeScript versions from unpkg.com. In environments without network access, the CLI will fail with `ENOTFOUND unpkg.com` errors.

### Manual Validation Scenarios

**CRITICAL**: After making any changes to the CLI or core library, ALWAYS test these scenarios:

1. **Help/Usage Display**:
   ```bash
   ./packages/mtsv/dist/cli.js  # Should show usage message
   ```

2. **Test File Processing** (requires network):
   ```bash
   ./packages/mtsv/dist/cli.js --verbose packages/mtsv/tests/5.0.0.d.ts  # Should analyze TypeScript compatibility
   ```

## Project Structure

### Key Directories
- `/` - Monorepo root with shared configuration
- `packages/mtsv/` - Main package containing CLI and library
- `packages/mtsv/src/` - Source code
- `packages/mtsv/src/cli.ts` - CLI entry point  
- `packages/mtsv/src/lib/` - Core library code
- `packages/mtsv/tests/` - Test files including .d.ts samples
- `packages/mtsv/dist/` - Build output (generated)

### Important Files
- `package.json` - Root package with shared scripts and configuration
- `packages/mtsv/package.json` - Main package configuration  
- `pnpm-workspace.yaml` - Workspace configuration
- `turbo.json` - Build pipeline configuration
- `packages/mtsv/tsdown.config.ts` - Build tool configuration
- `packages/mtsv/vitest.config.ts` - Test configuration

## Build Configuration

The project uses `tsdown` (powered by rolldown) for building:
- **Library bundle**: ESM format with TypeScript declarations
- **CLI bundle**: ESM format, executable, with source maps
- **Build time**: ~4 seconds total for both bundles

## Common Commands Reference

### Root Level Commands
```bash
pnpm install          # Install all dependencies (~18s)
pnpm run build        # Build all packages (~4s)  
pnpm run test         # Run all tests (~3s)
pnpm run lint         # Run all linting (~1s)
pnpm run dev          # Start development mode with watch
```

### Package Level Commands (in packages/mtsv/)
```bash
pnpm run dev          # Development with watch mode
pnpm run build        # Build this package only
pnpm run test:unit    # Run unit tests (~1s)
pnpm run test:size    # Size limit test (~1s)
```

## Validation Requirements

### Before Committing Changes
1. **ALWAYS run the build**: `pnpm run build`
2. **ALWAYS run all tests**: `pnpm run test`
3. **ALWAYS run linting**: `pnpm run lint`
4. **ALWAYS test CLI manually** with the validation scenarios above

### Timeout Guidelines
- **Dependency installation**: Set timeout to 120+ seconds (takes ~18s)
- **Build process**: Set timeout to 60+ seconds (takes ~4s)
- **All tests**: Set timeout to 60+ seconds (takes ~3s)
- **Unit tests**: Set timeout to 30+ seconds (takes ~1s)  
- **Linting**: Set timeout to 30+ seconds (takes ~1s)

**NEVER CANCEL** any of these operations prematurely. Wait for completion.

## Known Issues

1. **Network dependency**: The CLI requires internet access to function. In sandboxed environments, it will fail to fetch TypeScript versions from unpkg.com.

2. **No help flag**: The CLI doesn't implement `--help`. Run without arguments to see usage.

## Troubleshooting

- **Build failures**: Ensure Node.js and pnpm versions match those specified in `.node-version` and `package.json`
- **Test failures**: Run `pnpm run test` for all tests or `pnpm run test:unit` for unit tests only
- **CLI network errors**: Expected in environments without internet access
- **Watch mode issues**: Restart with `pnpm run dev --filter mtsv`

## Quick Start Checklist

When working with this repository for the first time:

- [ ] Verify Node.js version matches `.node-version`
- [ ] Install pnpm using version from `package.json`: `npm install -g pnpm`
- [ ] Install dependencies: `pnpm install` (120s timeout)
- [ ] Build project: `pnpm run build` (60s timeout)  
- [ ] Run all tests: `pnpm run test` (60s timeout)
- [ ] Run linting: `pnpm run lint` (30s timeout)
- [ ] Test CLI: `./packages/mtsv/dist/cli.js` (shows usage)
- [ ] Start development: `pnpm run dev --filter mtsv`