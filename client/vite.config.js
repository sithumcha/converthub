import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'ConvertHub',
        short_name: 'ConvertHub',
        description: 'Advanced File & Image Converter SaaS',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // react libraries vendor chunk එකට දාන්න
          if (id.includes('node_modules/react')) {
            return 'vendor';
          }
          // ui libraries ui chunk එකට දාන්න
          if (id.includes('node_modules/react-hot-toast')) {
            return 'ui';
          }
          // node_modules වලින් එන අනිත් ඔක්කොම common vendor chunk එකට
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})