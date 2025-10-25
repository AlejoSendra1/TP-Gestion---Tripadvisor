import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    // 1. Cambiamos el puerto de VITE (frontend) a 8081
    port: 8081,
    proxy: {
      '/publications': {
        target: 'http://localhost:8080', // Tu backend
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8080', // Tu backend
        changeOrigin: true,
      },
      '/sessions': {
        target: 'http://localhost:8080', // Tu backend
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
