import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const buildAssetsPath = 'sites/PDM_Entry/PDM_Entry_App/assets';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
        entryFileNames: `${buildAssetsPath}/index.js`,
        chunkFileNames: `${buildAssetsPath}/[name].js`,
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
