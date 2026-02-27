import { defineConfig } from "vite";
import rsc from "@vitejs/plugin-rsc";

// TODO:
// - polyfill node:util
// - UI for selecting and running demos

export default defineConfig({
  plugins: [
    rsc({
      serverHandler: false,
      entries: {
        client: "./src/client/entry.tsx",
        rsc: "./src/entry.ts",
      },
    }),
    {
      name: "custom-rsc-build",
      configResolved(config) {
        // avoid globalThis.AsyncLocalStorage injection in browser mode
        const plugin = config.plugins.find((p) => p.name === "rsc:inject-async-local-storage");
        delete plugin!.transform;
      },
    },
  ],
  environments: {
    client: {
      build: {
        outDir: "dist/client",
      },
    },
    rsc: {
      build: {
        outDir: "dist/rsc",
      },
      keepProcessEnv: false,
      resolve: {
        noExternal: true,
      },
      optimizeDeps: {
        esbuildOptions: {
          platform: "neutral",
        },
      },
    },
  },
});
