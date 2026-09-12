// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDevelopment = mode === 'development';

  // آدرس backend — در dev از env، در prod از دامنه نسبی
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3001,
      host: true,
      proxy: isDevelopment
        ? {
            // ✅ فقط در development فعال است
            // درخواست‌های /api/* را به backend محلی فوروارد می‌کند
            '/api': {
              target: backendTarget,
              changeOrigin: true,
              secure: false,
              // اگر backend با prefix خاصی سرو می‌شود، این را فعال کنید:
              // rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});