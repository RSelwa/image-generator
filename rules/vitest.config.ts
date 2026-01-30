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
    },
  }
}

export default defineConfig(config)
