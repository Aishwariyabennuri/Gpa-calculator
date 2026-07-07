import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gpa: resolve(__dirname, 'gpa.html'),
        cgpa: resolve(__dirname, 'cgpa.html'),
        simulator: resolve(__dirname, 'simulator.html'),
        analytics: resolve(__dirname, 'analytics.html')
      }
    },
    outDir: 'dist'
  },
  server: {
    open: true
  }
});
