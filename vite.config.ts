import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "launched-omissions-isaac-kennedy.trycloudflare.com"
    ],
    hmr: {
      host: "launched-omissions-isaac-kennedy.trycloudflare.com",
      protocol: "wss",
      clientPort: 443,
    },
    proxy: {
      "/v1": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v1/, ""),
      },
      "/admin": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
