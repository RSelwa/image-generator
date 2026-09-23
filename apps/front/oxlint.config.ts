import { defineConfig } from "oxlint"
import root from "../../oxlint.config.ts"

export default defineConfig({
  extends: [root],
  plugins: ["react", "nextjs"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/exhaustive-deps": "off",
    "nextjs/no-img-element": "off",
    "react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
  },
  overrides: [
    {
      files: ["**/*.test.tsx", "**/*.spec.tsx", "**/*.stories.tsx", "e2e/**"],
      rules: {
        "typescript/no-explicit-any": "off",
        "typescript/unbound-method": "off",
        "no-console": "off",
        "unicorn/consistent-function-scoping": "off",
      },
    },
    {
      files: ["**/*.stories.tsx"],
      rules: { "react/rules-of-hooks": "off" },
    },
  ],
})
