import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './ts_src'),
      '@assets': path.resolve(__dirname, './ts_src/assets'),
      '@scenes': path.resolve(__dirname, './ts_src/scenes'),
      '@entities': path.resolve(__dirname, './ts_src/entities'),
      '@systems': path.resolve(__dirname, './ts_src/systems'),
      '@ui': path.resolve(__dirname, './ts_src/ui'),
      '@utils': path.resolve(__dirname, './ts_src/utils'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
