import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Listen on the local network too, so phones on the same Wi-Fi can open the printed Network URL
  server: { host: true },
  preview: { host: true },
  build: {
    rollupOptions: {
      // The package marks its entries "use client" for Next.js; Vite has no server components, so the notice is noise
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
