import { svelte } from '@sveltejs/vite-plugin-svelte'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'
import { wuchale } from 'wuchale'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['@sqlite.org/sqlite-wasm'],
  },
  server: {
    host: '0.0.0.0',
    hmr: {
      overlay: false,
      port: 5173,
    },
  },
  build: {
    minify: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  plugins: [
    wuchale(),
    Icons({ compiler: 'svelte' }),
    AutoImport({
      include: [/\.svelte$/],
      resolvers: [
        (name) => {
          console.log('AutoImport checking:', name)
          // Call the actual IconsResolver
          const result = IconsResolver({
            prefix: 'Icon',
            extension: 'svelte',
          })(name)
          console.log('IconsResolver result:', result)
          return result
        },
      ],
      dts: 'src/auto-imports.d.ts',
      viteOptimizeDeps: true,
    }),
    svelte(),
    visualizer({ filename: 'dist/stats.html', open: false }),
    tsconfigPaths({ loose: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tempi',
        short_name: 'Tempi',
        start_url: '/',
        display: 'standalone',
        background_color: '#242424',
        theme_color: '#242424',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tempi.fly.dev\.com\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 }, // 5 minutes
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 days
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
            },
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
      },
    }),
  ],
})
