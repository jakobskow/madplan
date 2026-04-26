import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Madplan',
        short_name: 'Madplan',
        description: 'Din ugentlige madplanlægger',
        start_url: '/',
        display: 'standalone',
        background_color: '#faf7f4',
        theme_color: '#c17448',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        share_target: {
          action: '/library',
          method: 'GET',
          params: {
            url: 'import'
          }
        }
      }
    })
  ],
  server: { port: 5173 }
})
