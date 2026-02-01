import { fileURLToPath } from "node:url"
import { loadEnv } from "vite"
import { configDefaults, defineConfig } from "vitest/config"

const directoryUrl = new URL("../..", import.meta.url)
const rootPath = fileURLToPath(directoryUrl)

function config({ mode }) {
  return {
    test: {
      exclude: [...configDefaults.exclude],
      env: loadEnv(mode, rootPath, ""),
      reporters: process.env.GITHUB_ACTIONS ? ["verbose", "github-actions"] : ["verbose"],
      retry: 3, // Retry flaky tests up to 2 times (Firebase emulator can be flaky)
    },
  }
}

export default defineConfig(config)
