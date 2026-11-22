import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// Host Google yang TIDAK boleh di-cache (auth & data keuangan harus selalu segar)
const GOOGLE_API_HOSTS = [
  'sheets.googleapis.com',
  'www.googleapis.com',
  'oauth2.googleapis.com',
  'accounts.google.com',
  'apis.google.com',
]

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // service worker didaftarkan manual di main.js
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],

      manifest: {
        id: '/',
        name: 'FinFlow - Manajemen Keuangan',
        short_name: 'FinFlow',
        description: 'Catat dan pantau keuangan pribadi dengan data tersimpan di Google Sheets milik Anda.',
        lang: 'id',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#10412a',
        background_color: '#faf8ff',
        categories: ['finance', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Tambah Transaksi',
            short_name: 'Tambah',
            url: '/transactions?add=1',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
      },

      workbox: {
        // Pre-cache seluruh app shell agar bisa dibuka offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'],
        navigateFallback: '/index.html', // SPA: semua navigasi → index.html
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        runtimeCaching: [
          // 1) Google API & OAuth: selalu network, jangan pernah di-cache
          {
            urlPattern: ({ url }) => GOOGLE_API_HOSTS.includes(url.hostname),
            handler: 'NetworkOnly',
          },
          // 2) CSS Google Fonts
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          // 3) File font (woff2)
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // 4) Foto profil Google
          {
            urlPattern: ({ url }) => url.hostname.endsWith('googleusercontent.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'avatars',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: { enabled: false }, // ubah ke true bila ingin menguji SW di `npm run dev`
    }),
  ],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})