import antfu from "@antfu/eslint-config"

export default antfu({
  react: true,
  nextjs: true,
  typescript: true,
  jsonc: true,
  yaml: true,
  jsx: true,
  jsdoc: true,
  javascript: true,
  node: true,
  test: true,
  gitignore: true,
  isInEditor: false,

  ignores: ["**/*.stories.*", "**/cli/**"],

  stylistic: {
    quotes: "double",
    overrides: {
      "style/comma-dangle": ["error", "only-multiline"],
      "style/arrow-parens": ["error", "always"],
      "antfu/if-newline": "off",
      "style/operator-linebreak": ["error", "after"],
      "prefer-promise-reject-errors": "off",
      "style/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "import/consistent-type-specifier-style": ["error", "inline"],
      "style/multiline-ternary": ["error", "never"],
      "style/jsx-one-expression-per-line": ["error", { allow: "single-line" }],
      "style/quote-props": ["error", "as-needed"],
      "style/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
      ],
      "style/jsx-self-closing-comp": "error",
    },
  },

  rules: {
    // Next/react overrides
    "next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "off",

    // Antfu overrides
    "antfu/top-level-function": "off",

    // Typescript rules
    "ts/no-use-before-define": "warn",
    "ts/no-import-type-side-effects": "off",

    // Node rules
    "node/prefer-global/process": "off",
    "node/prefer-global/buffer": "off",

    // Custom rules
    "ts/ban-ts-comment": "off",
    "react-refresh/only-export-components": "off",
    "antfu/curly": "off",
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    // "ts/consistent-type-definitions": ["error", "type"],
    "ts/consistent-type-definitions": "off"
  },
})
