import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      "libs/*/vitest.config.ts",
      "functions/*/vitest.config.ts",
      "rules/vitest.config.ts",
      "apps/*/vitest.config.ts",
    ],
  },
})
