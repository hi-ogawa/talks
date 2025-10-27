import { defineConfig, ResolvedConfig } from "vite";

let resolvedConfig: ResolvedConfig;

export default defineConfig({
  plugins: [
    {
      name: "og-meta",
      configResolved(config) {
        resolvedConfig = config;
      },
      transformIndexHtml() {
        if (process.env.VERCEL_URL) {
          const base = new URL(resolvedConfig.base, process.env.VERCEL_URL);
          const ogImageUrl = new URL("./og-image.png", base).href;
          return [
            {
              tag: "meta",
              attrs: { property: "og:image", content: ogImageUrl },
            },
          ];
        }
      },
    },
  ],
});
