import { svelte } from '@sveltejs/vite-plugin-svelte'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'
import { wuchale } from 'wuchale'

export default defineConfig({
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
          const result = IconsResolver({
            prefix: 'Icon',
            extension: 'svelte',
          })(name)
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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Tempi',
        short_name: 'Tempi',
        description: 'Job marketplace client',
        start_url: '/',
        display: 'standalone',
        scope: '/',
        background_color: '#F8FAFC',
        theme_color: '#F8FAFC',
        categories: ['productivity'],
        screenshots: [
          {
            src: 'mobile-screenshot.png',
            sizes: '959x1600',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tempi\.fly\.dev\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
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
