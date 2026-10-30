import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * Inlines the built stylesheet into index.html: at ~20 KiB it costs more as a
 * separate render-blocking request than as bytes in the HTML. Lighthouse
 * "render-blocking requests" → 0.
 */
function inlineCss(): Plugin {
  return {
    name: "inline-build-css",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        for (const asset of Object.values(ctx.bundle ?? {})) {
          if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) continue;
          const link = new RegExp(
            `<link rel="stylesheet"[^>]*href="/${asset.fileName}"[^>]*>`,
          );
          if (link.test(html)) {
            html = html.replace(link, `<style>${asset.source as string}</style>`);
          }
        }
        return html;
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), inlineCss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Expose both VITE_* (Vite default) and EXPO_PUBLIC_* (Rork's cross-platform
  // public-env convention, written by tools like getOrCreateAuthConfig).
  envPrefix: ["VITE_", "EXPO_PUBLIC_"],
}));
