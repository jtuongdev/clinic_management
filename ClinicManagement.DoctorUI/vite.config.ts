import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],

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