import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const buildAssetsPath = 'sites/PDM_Entry/PDM_Entry_App/assets';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker file ends up at the dist root so SharePoint can serve it
      filename: 'sw.js',
      // Workbox config — cache app shell + API responses
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache SharePoint API calls for 5 minutes (stale-while-revalidate)
            urlPattern: /\/_api\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'sp-api-cache',
              expiration: { maxAgeSeconds: 300, maxEntries: 100 },
            },
          },
        ],
      },
      manifest: {
        name: 'מעקב גישה למתקן',
        short_name: 'Gate Control',
        description: 'מערכת מעקב כניסה ויציאה למתקן - גדוד 373',
        start_url: '/sites/PDM_Entry/',
        scope: '/sites/PDM_Entry/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#eef2f8',
        theme_color: '#007AFF',
        lang: 'he',
        dir: 'rtl',
        icons: [
          { src: '/app-logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/app-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  server: {
    proxy: {
      '/_api': 'http://localhost:3000/sites/PDM_Entry',
      '^/sites/[^/]+/_api': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `${buildAssetsPath}/index.[hash].js`,
        chunkFileNames: `${buildAssetsPath}/[name].[hash].js`,
        assetFileNames: (file) => {
          // file.name is deprecated but I don't care for now. FIX LATER - idan
          return file.name === 'index.css'
            ? `${buildAssetsPath}/[name].[ext]`
            : `${buildAssetsPath}/[name]-[hash].[ext]`;
        },
      },
    },
  },
});
