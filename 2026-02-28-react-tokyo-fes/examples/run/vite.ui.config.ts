import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

// TODO:
// - [x] integrate dist/rsc/index.js
// - [ ] polyfill node:util
//   - [x] minimal
//   - [ ] full match with node:util for our output
//     - temporary references map, FormData, etc.
//     - color output
// - [ ] style ANSI log output
// - [x] code highlight
// - [ ] mobile layout
// - [x] split server-function-arguments demo source file

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
