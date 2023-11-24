import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["index.ts"],
  bundle: true,
  outfile: "dist/browser.js",
  target: "es6",
  platform: "browser",
})