import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Recall - 1-4-7 Study Tracker",
        short_name: "Recall",
        description: "Track what you studied and get reminded on day 4 and day 7.",
        theme_color: "#2B4570",
        background_color: "#F5F6F2",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        // Let our own /public/sw-push.js handle push events; workbox just
        // precaches the app shell for offline installability.
        importScripts: ["sw-push.js"],
      },
    }),
  ],
  server: { port: 5173 },
});
