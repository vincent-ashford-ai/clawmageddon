import { defineConfig } from 'vite';

export default defineConfig({
  base: '/clawmageddon/',
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
