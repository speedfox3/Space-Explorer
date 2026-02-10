import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/state': 'http://localhost:3000',
      '/actions': 'http://localhost:3000',
      '/analyze': 'http://localhost:3000',
      '/minigame': 'http://localhost:3000',
    },
  },
});
