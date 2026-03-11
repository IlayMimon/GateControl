import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { readFileSync } from 'fs';

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
  version: string;
};
const assetsFolder = `assets${version}`;
const buildAssetsPath = `sites/PDM_Entry/PDM_Entry_App/${assetsFolder}`;

const aspxContent = `<!doctype html>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls"
Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral,
PublicKeyToken=71e9bce111e9429c" %>
<html
  lang="en"
  xmlns:mso="urn:schemas-microsoft-com:office:office"
  xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882"
>
  <%@ Register Tagprefix="SharePoint"
  Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint,
  Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gate Control</title>
    <meta name="theme-color" content="#007AFF" />
    <meta name="description" content="מערכת מעקב כניסה ויציאה למתקן - גדוד 373" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Gate Control" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" type="image/png" href="/sites/PDM_Entry/PDM_Entry_App/${assetsFolder}/app-logo.png" />
    <link rel="apple-touch-icon" href="/sites/PDM_Entry/PDM_Entry_App/${assetsFolder}/app-logo.png" />
    <script
      type="module"
      crossorigin
      src="/sites/PDM_Entry/PDM_Entry_App/${assetsFolder}/index.js"
    ></script>
    <link
      rel="stylesheet"
      crossorigin
      href="/sites/PDM_Entry/PDM_Entry_App/${assetsFolder}/index.css"
    />

    <!--[if gte mso 9
      ]><SharePoint:CTFieldRefs
        runat="server"
        Prefix="mso:"
        FieldList="FileLeafRef"
        ><xml>
          <mso:CustomDocumentProperties>
            <mso:MediaServiceImageTags
              msdt:dt="string"
            ></mso:MediaServiceImageTags>
            <mso:lcf76f155ced4ddcb4097134ff3c332f
              msdt:dt="string"
            ></mso:lcf76f155ced4ddcb4097134ff3c332f>
            <mso:TaxCatchAll msdt:dt="string"></mso:TaxCatchAll>
          </mso:CustomDocumentProperties> </xml></SharePoint:CTFieldRefs
    ><![endif]-->
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

function generateSharePointAspx(): Plugin {
  return {
    name: 'generate-sharepoint-aspx',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: `${buildAssetsPath}/app-logo.png`,
        source: readFileSync('./public/app-logo.png'),
      });
      this.emitFile({ type: 'asset', fileName: 'index.aspx', source: aspxContent });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    generateSharePointAspx(),
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
          { src: '/app-logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
    https: {},
    host: true,
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
        assetFileNames: `${buildAssetsPath}/[name].[ext]`,
      },
    },
  },
});
