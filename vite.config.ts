import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Base path: '/' in dev, '/lb-cybermap/' for the GitHub Pages production build.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lb-cybermap/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
}));
