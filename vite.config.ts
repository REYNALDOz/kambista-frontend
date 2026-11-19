import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // The API only allows this origin (CORS_ORIGIN). Failing is better than silently
  // moving to another port, which would make every request fail with a CORS error.
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    // Operations are shown on the day of the user, so the tests fix the time zone of Peru.
    env: { TZ: 'America/Lima' },
  },
});
