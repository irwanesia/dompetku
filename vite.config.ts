import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'DompetKu - Budget Tracker Harian',
          short_name: 'DompetKu',
          description: 'Pelacak anggaran harian modern',
          theme_color: '#059669',
          background_color: '#f1f5f9',
          display: 'standalone',
          start_url: '/',
          icons: [
            {src: '/icon-192.png', sizes: '192x192', type: 'image/png'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
