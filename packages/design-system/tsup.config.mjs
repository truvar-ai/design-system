import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/core/index.jsx",
    brand: "src/brand/index.js",
    icons: "src/icons/index.js",
    charts: "src/charts/index.js",
    voice: "src/voice/index.js",
    os: "src/os/index.js",
    crm: "src/crm/index.js",
    widget: "src/widget/index.js",
    // Internal files, not import paths of their own: the flags (every country's SVG) and the phone number
    // data are large, so each lives in its own file. An app's bundler then leaves them out unless the app
    // renders a Flag, PhoneField or CountryPicker.
    "internal/flag": "src/core/Flag.jsx",
    "internal/intl": "src/core/intl.jsx",
    "internal/countries": "src/core/countries.js",
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
