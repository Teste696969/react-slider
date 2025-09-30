import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/react-slider/', // Caminho base para GitHub Pages
  build: {
    outDir: '../',
    emptyOutDir: false, // also necessary
  }
});