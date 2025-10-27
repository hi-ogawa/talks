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
        // https://vercel.com/docs/environment-variables/system-environment-variables#VERCEL_URL
        if (process.env.VERCEL_URL) {
          const base = new URL(
            resolvedConfig.base,
            "https://" + process.env.VERCEL_URL,
          );
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
