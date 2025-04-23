// prettier-ignore
import 'dotenv-flow/config';

import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

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
