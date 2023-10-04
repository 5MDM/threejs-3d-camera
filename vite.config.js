import {resolve} from "path";
import {defineConfig} from "vite";

export default defineConfig({
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
  base: "/threejs-3d-camera/",
  root: "/home/runner/threejs-3d-camera/out/"
});