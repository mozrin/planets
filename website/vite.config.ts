import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  cacheDir: "/tmp/planets-vite-cache",
  server: {
    host: '0.0.0.0',
    allowedHosts: ["mozrin-planets.mozrin.com"],
    hmr: { clientPort: 443 },
    proxy: { '/api': 'http://server:3000' }
  }
});
