import { defineConfig, type ViteUserConfig } from 'vitest/config'

const config: ViteUserConfig = defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    setupFiles: './vitest.setup.ts',
    env: {
      IS_REACT_ACT_ENVIRONMENT: 'true'
    },
    server: {
      deps: {
        inline: ['vitest-package-exports']
      }
    }
  }
})

export default config
