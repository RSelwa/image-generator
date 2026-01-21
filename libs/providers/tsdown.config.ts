import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "db-refs": "src/db-refs.ts",
    firebase: "src/firebase.ts",
    stripe: "src/stripe.ts",
    config: "src/config.ts",
    opensearch: "src/opensearch.ts",
    "firebase-client": "src/firebase-client/index.ts",
  },
  outDir: "dist",
  target: "es2022",
  sourcemap: true,
  dts: true,
  platform: "node",
})
