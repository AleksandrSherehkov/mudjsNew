import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'vite-plugin-compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress', // или 'gzip'
      ext: '.br',
      threshold: 10240,
      apply: 'build', // включаем только при билде
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // пока можно оставить @import, но постепенно лучше перейти на @use
        additionalData: `@import "./scss/main.scss";`,
      },
    },
  },
  json: {
    stringify: false,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/maps': {
        target: 'https://dreamland.rocks',
        changeOrigin: true,
        secure: false,
      },
      '/help': {
        target: 'https://dreamland.rocks',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
