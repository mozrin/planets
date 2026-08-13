import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    hmr: { clientPort: 443 },
    proxy: { '/api': 'http://server:3000' }
  }
});
