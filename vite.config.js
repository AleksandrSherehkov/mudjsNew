import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
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
