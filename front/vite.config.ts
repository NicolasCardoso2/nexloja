import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const isElectron = process.env.ELECTRON === 'true';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  // Caminhos relativos para funcionar dentro do Electron empacotado
  base: isElectron ? './' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
