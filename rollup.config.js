import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ],
  external: ["react", "react-dom"], // Mark peer deps as external
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
      preferBuiltins: false, // Important for browser bundles
    }),
    commonjs(),
  ],
};
