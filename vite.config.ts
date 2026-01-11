import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "sierra-violation-memorial-shore.trycloudflare.com",
      "rabbit-anonymous-arrivals-future.trycloudflare.com",
      "parental-rapidly-not-magnitude.trycloudflare.com"
    ],
    hmr: {
      host: "parental-rapidly-not-magnitude.trycloudflare.com",
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
