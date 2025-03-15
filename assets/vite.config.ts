import path from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin, ConfigEnv, UserConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { analyzer } from 'vite-bundle-analyzer'
import viteCompression from 'vite-plugin-compression'
import cssnano from 'cssnano'
import cssnanoPresetAdvanced from 'cssnano-preset-advanced'

interface TopbarPlugin extends Plugin {
  name: string
  transform(code: string, id: string): { code: string; map: null } | undefined
}

const createTopbarPlugin = (): TopbarPlugin => ({
  name: 'topbar-module',
  transform(code, id) {
    if (id.endsWith('vendor/topbar.js')) {
      return {
        code: `
          let topbar;
          (function(window, document) {
            ${code}
          })(window, document);
          export default window.topbar;
        `,
        map: null,
      }
    }
  },
})

export default defineConfig(({ command }) => {
  const isDev = command !== 'build'

  if (isDev) {
    process.stdin.on('close', () => process.exit(0))
    process.stdin.resume()
  }

  return {
    server: { cors: true },
    base: '/',
    publicDir: 'static',
    plugins: [
      analyzer(), // Bundle size analysis
      svelte({ preprocess: [] }),
      createTopbarPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Temporah',
          short_name: 'Temporah',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          start_url: '/',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
          ],
        },
        devOptions: { enabled: true, type: 'module' },
        outDir: '../priv/static',
        srcDir: 'js',
        injectRegister: 'inline',
        strategies: 'generateSW',
        includeAssets: ['**/*'],
        filename: 'sw.js',
      }),
      viteCompression({ algorithm: 'gzip', threshold: 1024 }), // Min size for compression
      viteCompression({ algorithm: 'brotliCompress', threshold: 1024 }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/global.scss";`,
        },
      },
      postcss: {
        plugins: [
          cssnano({
            preset: cssnanoPresetAdvanced(),
          }),
        ],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './js'),
      },
    },
    build: {
      target: 'esnext',
      emptyOutDir: true,
      outDir: '../priv/static',
      sourcemap: isDev,
      manifest: 'vite_manifest.json',
      minify: isDev ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
          passes: 3,
          pure_funcs: ['console.info', 'console.debug', 'console.log'], // Even more aggressive
        },
        mangle: { toplevel: true, properties: { regex: /^_/ } }, // Mangle private props
      },
      cssMinify: true,
      rollupOptions: {
        input: { app: './js/app.js' },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: ({ name }) => {
            if (name.includes('node_modules')) return 'assets/vendor/[name].[hash].js'
            if (name.includes('common')) return 'assets/common/[name].[hash].js'
            return 'assets/chunks/[name].[hash].js'
          },
          assetFileNames: 'assets/[name].[hash][extname]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@inertiajs')) return 'vendor-inertia'
              if (id.includes('bits-ui')) return 'vendor-bits-ui'
              if (id.includes('svelte')) return 'vendor-svelte'
              if (id.includes('lodash')) return 'vendor-lodash'
              if (id.includes('axios')) return 'vendor-axios'
              return 'vendor-common'
            }
          },
        },
        treeshake: {
          moduleSideEffects: ['*.css'],
          tryCatchDeoptimization: false,
          preset: 'smallest', // Most aggressive tree-shaking
        },
        external: ['/fonts/*', '/images/*'],
      },
    },
  }
})
