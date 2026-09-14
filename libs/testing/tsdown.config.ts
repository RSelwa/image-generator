import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    orm: "src/orm.ts",
    factory: "./src/factory.ts",
    emulator: "./src/emulator.ts",
    "document-snapshot": "./src/document-snapshot.ts",
  },
  outDir: "dist",
  target: "es2022",
  sourcemap: true,
  dts: true,
  fixedExtension: false,
})
