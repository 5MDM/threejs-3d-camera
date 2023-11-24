import {execSync} from "child_process";
import fs from "fs";
import * as esbuild from "esbuild";
import pkg from "./package.json" assert { type: "json" };

const args = process.argv.slice(2);

if (args.includes("--no-dts") || args.includes("-n")) {
  console.log("Skipped emitting d.ts files\n");
} else {
  console.log("Emitting d.ts files...");
  const tscTime = performance.now();
  execSync("tsc --emitDeclarationOnly", { stdio: "inherit" });
  const files = fs.readdirSync("src");
  for (const file of files) {
    if (file.endsWith(".d.ts")) {
      fs.copyFileSync(`src/${file}`, `dist/${file}`);
    }
  }
  console.log(`Done in ${Math.round((performance.now() - tscTime) * 1E2) / 1E2}ms\n`);
}

console.log("Building bundle for browser...");
const browserTime = performance.now();
await esbuild.build({
  entryPoints: ["src/browser.ts"],
  bundle: true,
  outfile: "dist/browser.js",
  target: "es6",
  platform: "browser",
  format: "iife",
  globalName: "Three3DCamera",
})
console.log(`Done in ${Math.round((performance.now() - browserTime) * 1E2) / 1E2}ms\n`);

console.log("Building bundle for ES module...");
const esmTime = performance.now();
await esbuild.build({
  entryPoints: ["src/module.ts"],
  bundle: true,
  external: [...Object.keys(pkg.peerDependencies || {})],
  outfile: "dist/index.js",
  target: "es6",
  platform: "neutral",
})
console.log(`Done in ${Math.round((performance.now() - esmTime) * 1E2) / 1E2}ms`);