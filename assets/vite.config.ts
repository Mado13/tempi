import path from "node:path";
import { defineConfig } from "vite";
import type { Plugin, ConfigEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";

interface TopbarPlugin extends Plugin {
	name: string;
	transform(
		code: string,
		id: string,
	):
		| {
				code: string;
				map: null;
		  }
		| undefined;
}

const createTopbarPlugin = (): TopbarPlugin => ({
	name: "topbar-module",
	transform(code, id) {
		if (id.endsWith("vendor/topbar.js")) {
			return {
				code: `
          let topbar;
          (function(window, document) {
            ${code}
          })(window, document);
          export default window.topbar;
        `,
				map: null,
			};
		}
	},
});

export default defineConfig(({ command }: ConfigEnv) => {
	const isDev = command !== "build";

	if (isDev) {
		// Terminate the watcher when Phoenix quits
		process.stdin.on("close", () => {
			process.exit(0);
		});

		process.stdin.resume();
	}

	const config = {
		server: {
			cors: true,
		},
		publicDir: "static",
		plugins: [
			svelte({
				preprocess: [],
			}),
			createTopbarPlugin(),
			VitePWA({
				registerType: "autoUpdate",
				manifest: {
					name: "Temporah",
					display: "standalone",
					orientation: "portrait",
					theme_color: "#ffffff",
					background_color: "#ffffff",
					start_url: "/",
				},

				workbox: {
					globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
					navigateFallback: null,
				},
				devOptions: {
					enabled: true,
					type: "module",
				},
				outDir: "../priv/static",
				srcDir: "js",
				injectRegister: "inline",
				strategies: "generateSW",
				includeAssets: ["**/*"],
				filename: "sw.js",
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./js"),
			},
		},
		build: {
			target: "esnext",
			emptyOutDir: false,
			polyfillDynamicImport: true,
			outDir: "../priv/static",
			sourcemap: isDev,
			manifest: "vite_manifest.json",
			rollupOptions: {
				input: {
					app: "./js/app.ts",
				},
				output: {
					entryFileNames: "assets/[name].[hash].js",
					chunkFileNames: "assets/[name].[hash].js",
					assetFileNames: "assets/[name].[hash][extname]",
				},
				external: ["/fonts/*", "/images/*"],
			},
		},
	};

	return config;
});
