import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/am4": {
        target: "https://airlinemanager.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/am4/, "")
      }
    }
  }
});
