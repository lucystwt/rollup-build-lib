import { defineConfig } from "rollup"
import commonjs from "@rollup/plugin-commonjs"
import nodeResolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import { babel } from "@rollup/plugin-babel"
import dts from "rollup-plugin-dts"

export default defineConfig([
  {
    input: "src/main.ts",
    output: [
      { file: "dist/index.cjs", format: "cjs", sourcemap: true },
      { file: "dist/index.mjs", format: "es", sourcemap: true },
    ],
    plugins: [
      commonjs(),
      nodeResolve(),
      typescript({ tsconfig: "./tsconfig.json" }),
      babel({
        presets: ["@babel/preset-env"],
        extensions: [".js"],
        babelHelpers: "bundled",
      }),
    ],
  },
  {
    input: "dist/types/main.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
])
