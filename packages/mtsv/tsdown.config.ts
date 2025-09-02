import { defineConfig, type Options, type UserConfig } from 'tsdown'

const commonConfig = {
  clean: true,
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  external: [],
  treeshake: true,
  tsconfig: 'tsconfig.build.json'
} satisfies Options

const config: UserConfig = defineConfig([
  {
    // Library bundle
    ...commonConfig,
    entry: 'src/lib/index.ts'
  },
  // CLI bundle
  {
    ...commonConfig,
    entry: 'src/cli.ts',
    dts: false,
    sourcemap: true
  }
]) as UserConfig

export default config
