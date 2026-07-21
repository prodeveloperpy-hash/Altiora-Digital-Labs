import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the backend during development so the frontend can call
    // relative `/api/*` paths without CORS concerns. Configure the target via
    // VITE_DEV_API_PROXY (defaults to http://localhost:8000).
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY ?? 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Admin image uploads are served by the backend under /uploads.
      '/uploads': {
        target: process.env.VITE_DEV_API_PROXY ?? 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Avoid publishing original source in production artifacts by default.
    sourcemap: false,
  },
});
