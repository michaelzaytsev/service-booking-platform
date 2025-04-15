import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { env, viteResolveAlias } from '@sbp/run';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: viteResolveAlias,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: Number(env.LANDING_PORT),
  },
});
