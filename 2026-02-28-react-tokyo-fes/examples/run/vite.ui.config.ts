import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// TODO:
// - [x] integrate dist/rsc/index.js
// - [ ] polyfill node:util
//   - [x] minimal
//   - [ ] style with ANSI
//   - [ ] full match with node:util for our output
// - [ ] code highlight
// - [ ] mobile layout
// - [ ] split server-function-arguments demo source file

export default defineConfig({
  resolve: {
    alias: {
      "node:util": fileURLToPath(new URL("./src/ui/polyfills/node-util.ts", import.meta.url)),
    },
  },
  build: {
    outDir: "dist/ui",
  },
});
