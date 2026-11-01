import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/core/index.jsx",
    brand: "src/brand/index.js",
    icons: "src/icons/index.js",
    charts: "src/charts/index.js",
    voice: "src/voice/index.js",
    os: "src/os/index.js",
  },
  format: ["esm"],
  target: "es2020",
  splitting: true,
  clean: true,
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  // React Aria components use hooks, so every entry is a client module in Next.js App Router
  banner: { js: '"use client";' },
  loader: { ".json": "json" },
});
