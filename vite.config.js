// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'oxc',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (
            id.includes('leaflet') ||
            id.includes('react-leaflet')
          ) {
            return 'map';
          }

          if (
            id.includes('recharts') ||
            id.includes('d3-') ||
            id.includes('victory-vendor')
          ) {
            return 'charts';
          }

          if (id.includes('@turf')) {
            return 'turf';
          }

          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('@tanstack/react-query') ||
            id.includes('scheduler') ||
            /[\\/]node_modules[\\/]react[\\/]/.test(id)
          ) {
            return 'vendor';
          }

          return 'vendor-misc';
        },
      },
    },
  },

  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});