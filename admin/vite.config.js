import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.VITE_PORT) || 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'https://cellphone-backend-3gmw.onrender.com/',
        changeOrigin: true,
      },
    },
  },
});
