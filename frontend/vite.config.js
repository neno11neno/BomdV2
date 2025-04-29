import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isDocker = process.env.DOCKER === 'true';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 9987,
    proxy: {
      '/api': {
        target: isDocker ? 'http://backend:5000' : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: isDocker ? 'http://backend:5000' : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/tags': {
        target: isDocker ? 'http://backend:5000' : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
