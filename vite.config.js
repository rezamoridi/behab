// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    target: 'esnext',
    sourcemap: false,               // کاهش اندازه dist
    // ✅ minify حذف شد — Vite 8 از 'oxc' به‌طور پیش‌فرض استفاده می‌کند
    cssCodeSplit: true,             // CSS per-chunk
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false,    // سریع‌تر

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          // ─── Leaflet stack ───
          if (
            id.includes('leaflet') ||
            id.includes('react-leaflet')
          ) {
            return 'map';
          }

          // ─── Charts (Recharts + d3) ───
          if (
            id.includes('recharts') ||
            id.includes('d3-') ||
            id.includes('victory-vendor')
          ) {
            return 'charts';
          }

          // ─── ApexCharts (اگر migrate نشده باشد) ───
          if (
            id.includes('apexcharts') ||
            id.includes('react-apexcharts')
          ) {
            return 'charts-apex';
          }

          // ─── Turf ───
          if (id.includes('@turf')) {
            return 'turf';
          }

          // ─── Core vendor ───
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('@tanstack/react-query') ||
            id.includes('scheduler') ||
            /[\\/]node_modules[\\/]react[\\/]/.test(id)
          ) {
            return 'vendor';
          }

          // ─── Misc vendor ───
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