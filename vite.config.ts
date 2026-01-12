import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "incidence-radar-conservative-nottingham.trycloudflare.com",
    ],
    hmr: {
      host: "incidence-radar-conservative-nottingham.trycloudflare.com",
      protocol: "wss",
      clientPort: 443,
    },
    proxy: {
      "/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
