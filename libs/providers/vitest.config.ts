import path from "node:path"
import { configDefaults, defineConfig } from "vitest/config"

export default defineConfig({
  test: { exclude: [...configDefaults.exclude], passWithNoTests: true },
  resolve: { alias: { "~": path.resolve(import.meta.dirname, "./src") } },
})
