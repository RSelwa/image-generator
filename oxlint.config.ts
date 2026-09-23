import { defineConfig } from "oxlint"

export default defineConfig({
  plugins: ["import", "typescript", "unicorn"],
  options: {
    typeAware: true,
  },
  categories: {
    correctness: "warn",
    suspicious: "warn",
    perf: "warn",
    pedantic: "off",
    style: "off",
    restriction: "off",
  },
  rules: {
    "import/no-cycle": "error",
    "import/no-self-import": "error",
    "import/no-duplicates": "warn",
    "import/no-unassigned-import": ["warn", { allow: ["**/*.css"] }],
    "typescript/no-floating-promises": "off",
    "typescript/no-misused-promises": [
      "error",
      { checksVoidReturn: { attributes: false } },
    ],
    "typescript/switch-exhaustiveness-check": "error",
    "unicorn/no-thenable": "error",
    "unicorn/prefer-node-protocol": "error",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/restrict-template-expressions": "off",
    "unicorn/no-array-sort": "off",
    "unicorn/prefer-set-has": "off",
    "no-await-in-loop": "off",
    "no-underscore-dangle": "off",
    "no-shadow": "off",
    "no-unmodified-loop-condition": "off",
    "typescript/consistent-return": "off",
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
  },
  ignorePatterns: [
    "**/dist/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/.next/**",
    "**/isolate/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "**/*.d.ts",
    "**/*.d.mts",
    "cli/template/**",
    "google-cloud-sdk/**",
  ],
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.spec.ts", "**/test/**/*.ts"],
      rules: {
        "typescript/no-explicit-any": "off",
        "typescript/unbound-method": "off",
        "no-console": "off",
        "unicorn/consistent-function-scoping": "off",
      },
    },
    {
      files: ["scripts/**", "cli/**"],
      rules: { "no-console": "off" },
    },
  ],
})
