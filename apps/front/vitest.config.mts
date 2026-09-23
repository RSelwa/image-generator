import { resolve } from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: { name: "unit", include: ["**/*.test.ts"] },
  resolve: { alias: { "@": resolve(import.meta.dirname, "./") } },
})
