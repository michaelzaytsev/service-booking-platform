import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
