import { defineConfig } from "rollup"
import commonjs from "@rollup/plugin-commonjs"
import nodeResolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import { babel } from "@rollup/plugin-babel"
import postcss from "rollup-plugin-postcss"
import autoprefixer from "autoprefixer"
import peerDepsExternal from "rollup-plugin-peer-deps-external"
import terser from "@rollup/plugin-terser"

export default defineConfig([
  {
    input: "src/main.ts",
    output: [
      { file: "dist/index.cjs", format: "cjs", sourcemap: true },
      { file: "dist/index.mjs", format: "es", sourcemap: true },
    ],
    plugins: [
      peerDepsExternal(),
      commonjs(),
      nodeResolve(),
      typescript(),
      babel({
        babelHelpers: "bundled",
        presets: ["@babel/preset-env"],
        extensions: [".js", ".ts"],
      }),
      postcss({ plugins: [autoprefixer], modules: true }),
      terser(),
    ],
  },
  {
    input: "dist/types/main.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
    external: [/\.css$/],
  },
])
