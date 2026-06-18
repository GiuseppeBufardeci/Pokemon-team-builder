import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            // Caching dei dati JSON di PokeAPI
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi-cache',
              expiration: {
                maxEntries: 100, // Mantiene in memoria le ultime 100 chiamate
                maxAgeSeconds: 60 * 60 * 24 * 30 // Conserva i dati per 30 giorni
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Caching delle immagini (sprites) dei Pokémon
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokemon-sprites-cache',
              expiration: {
                maxEntries: 500, // Consente di salvare fino a 500 immagini di Pokémon
                maxAgeSeconds: 60 * 60 * 24 * 30 // Conserva le immagini per 30 giorni
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Pokémon Team Builder',
        short_name: 'PokeTeam',
        theme_color: '#e63b10',
        background_color: '#f4f0ea',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
