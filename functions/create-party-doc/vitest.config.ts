import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadEnv } from "vite"
import { configDefaults, defineConfig } from "vitest/config"

const directoryUrl = new URL("../..", import.meta.url)
const rootPath = fileURLToPath(directoryUrl)

function config({ mode }) {
  return {
    test: {
      exclude: [...configDefaults.exclude],
      env: {
        ...loadEnv(mode, rootPath, ""),
        ...loadEnv(mode, process.cwd(), ""),
      },
    },
    resolve: { alias: { "~": resolve(__dirname, "./src") } },
  }
}

export default defineConfig(config)
