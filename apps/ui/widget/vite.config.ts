import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'path';

dotenvExpand.expand(
  dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
  }),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@sbp/ui': path.resolve(__dirname, '../../../packages/ui/src'),
      '@sbp/types': path.resolve(__dirname, '../../../packages/types/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: Number(process.env.WIDGET_PORT),
  },
});
