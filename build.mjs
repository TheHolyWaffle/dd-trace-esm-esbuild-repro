import { build } from "esbuild";
import ddPlugin from "dd-trace/esbuild.js";

await build({
  entryPoints: [{ in: "src/index.ts", out: "index" }],
  outdir: "dist",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  external: ["dd-trace"],
  plugins: [ddPlugin],
  treeShaking: true,
  minify: true,
  keepNames: true,
  sourcemap: true,
  logLevel: "info",
});
