import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps every URL relative, so the build works at /resto/ on GitHub Pages and locally.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2020', assetsInlineLimit: 0 }
});
