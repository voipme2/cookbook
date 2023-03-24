import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://192.168.1.8:8000/", changeOrigin: true },
    },
    watch: {
      usePolling: true,
    },
  },
});
