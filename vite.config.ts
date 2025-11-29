import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use '/' for web deployment (Vercel/Netlify), './' for Electron/file:// protocol
  base: process.env.NODE_ENV === 'production' && process.env.VITE_BUILD_TARGET !== 'electron' ? '/' : './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});