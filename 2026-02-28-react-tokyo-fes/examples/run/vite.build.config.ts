import { defineConfig } from "vite";
import rsc from "@vitejs/plugin-rsc";

export default defineConfig({
  plugins: [
    rsc({
      serverHandler: false,
      entries: {
        client: "virtual:empty",
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
    {
      name: "virtual-empty",
      resolveId(id) {
        if (id === "virtual:empty") {
          return "\0" + id;
        }
      },
      load(id) {
        if (id === "\0virtual:empty") {
          return "export {}";
        }
      },
    },
  ],
  environments: {
    client: {
      build: {
        outDir: "dist/rsc-client",
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
