import { defineConfig } from "vite";

// TODO:
// - integrate dist/rsc/index.js
//   - polyfill node:util
// - code highlight
// - split server-function-arguments

export default defineConfig({
  build: {
    outDir: "dist/ui",
  },
});
