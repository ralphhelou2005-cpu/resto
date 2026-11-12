import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* The site is served from https://ralphhelou2005-cpu.github.io/resto/, so production builds use base '/resto/'.
   The pre-render and the browser bundle then produce identical image URLs.
   If a custom domain is added later, change BASE to '/'. */
const BASE = '/resto/';

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? BASE : '/',
  plugins: [react()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
  preview: { port: 5175 }
}));
