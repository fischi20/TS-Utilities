import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  tsconfig: "tsconfig.json",
  bundle: false,
  keepNames: true,
  target: "es2015",
  skipNodeModulesBundle: true,
});
