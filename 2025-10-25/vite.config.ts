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
        // https://github.com/vercel/next.js/blob/498349c375e2602f526f64e8366992066cfa872c/packages/next/src/lib/metadata/resolvers/resolve-url.ts#L10-L55
        if (process.env.VERCEL_URL) {
          const origin =
            process.env.VERCEL_ENV === "preview"
              ? process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL
              : process.env.VERCEL_PROJECT_PRODUCTION_URL;
          const ogImageUrl = new URL(
            "./og-image.png",
            new URL(resolvedConfig.base, `https://${origin}`),
          ).href;
          return [
            {
              tag: "meta",
              attrs: { property: "og:image", content: ogImageUrl },
            },
            {
              tag: "meta",
              attrs: { name: "twitter:card", content: "summary_large_image" },
            },
          ];
        }
      },
    },
  ],
});
