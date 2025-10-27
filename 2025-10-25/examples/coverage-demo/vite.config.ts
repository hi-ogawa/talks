import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      clean: false,
      provider: 'v8',
      // provider: 'istanbul',
    }
  }
})
