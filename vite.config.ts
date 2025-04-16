import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to the backend server
      "/api": {
        target: "http://localhost:3000", // Assuming backend runs on port 3000
        changeOrigin: true, // Recommended for virtual hosted sites
        // secure: false, // Uncomment if backend uses self-signed HTTPS cert
        // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if backend doesn't expect /api prefix
      },
    },
  },
});
