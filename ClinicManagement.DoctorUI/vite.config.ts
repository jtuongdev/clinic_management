import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],

  server: {
    port: 3001,

    proxy: {
      '/api': {
        target: 'https://localhost:7081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});