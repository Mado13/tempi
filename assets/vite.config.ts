import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { preprocessMeltUI, sequence } from '@melt-ui/pp'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import path from 'node:path'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'

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
      Icons({ compiler: 'svelte' }),
      AutoImport({
        resolvers: [
          IconsResolver({
            prefix: 'Icon',
            extension: 'svelte',
          }),
        ],
        dts: 'src/auto-imports.d.ts',
      }),

      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './paraglide',
      }),

      svelte({
        compilerOptions: {
          hmr: true,
          modernAst: true,
          dev: isDev,
        },
        preprocess: [sequence([vitePreprocess({ script: true }), preprocessMeltUI()])],
      }),

      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        includeAssets: ['**/*'],
        outDir: '../priv/static',
        srcDir: 'js',
        filename: 'sw.js',
        strategies: 'generateSW',
        manifest: {
          name: 'Tempi',
          short_name: 'Tempi',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          background_color: '#ffffff',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/icons/icon2.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icons/icon1.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/',
          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|woff2)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'assets-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: isDev,
          type: 'module',
        },
      }),

      viteCompression({ algorithm: 'gzip', threshold: 512 }),
      viteCompression({ algorithm: 'brotliCompress', threshold: 512 }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './js'),
        $paraglide: path.resolve(__dirname, './paraglide'),
        $components: path.resolve(__dirname, './js/Components/'),
      },
    },

    build: {
      target: 'es2017',
      emptyOutDir: true,
      outDir: '../priv/static',
      sourcemap: isDev,
      manifest: true,
      cssMinify: true,
      minify: isDev ? false : 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
          passes: 3,
          pure_funcs: ['console.info', 'console.debug', 'console.log'],
        },
        mangle: {
          toplevel: true,
          properties: {
            regex: /^_/,
          },
        },
      },

      rollupOptions: {
        input: { app: './js/app.js' },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/chunks/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash][extname]',
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('@inertiajs')) return 'vendor-inertia'
            if (id.includes('svelte')) return 'vendor-svelte'
            if (id.includes('@melt-ui')) return 'vendor-melt'
            if (id.includes('runed')) return 'vendor-runed'
            if (id.includes('@inlang')) return 'vendor-i18n'

            return 'vendor-common'
          },
        },
        treeshake: {
          moduleSideEffects: ['*.css'],
          tryCatchDeoptimization: false,
          preset: 'smallest',
        },
        external: ['/fonts/*', '/images/*'],
      },
    },
  }
})
