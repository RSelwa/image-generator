import { defineConfig } from "oxfmt"

export default defineConfig({
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  semi: false,
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  ignorePatterns: [
    "cli/template/**/*",
    "google-cloud-sdk/**",
    "pnpm-lock.yaml",
  ],
})
