import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // For GitHub Pages deployment, set VITE_BASE_PATH=/connect-play/
  // For Lovable or root deployment, leave empty or set to /
  const basePath = process.env.VITE_BASE_PATH || '/';

  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'audio/**/*'],
        manifest: {
          name: 'Mythos Quest',
          short_name: 'Mythos Quest',
          description: 'A Lovecraftian horror game - Hero Quest meets Mansions of Madness',
          theme_color: '#1a1a2e',
          background_color: '#0f0f1a',
          display: 'standalone',
          orientation: 'landscape',
          start_url: basePath,
          scope: basePath,
          icons: [
            {
              src: 'icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['games', 'entertainment'],
          screenshots: [
            {
              src: 'icons/screenshot-wide.png',
              sizes: '1280x720',
              type: 'image/png',
              form_factor: 'wide'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ogg,mp3,webp,jpg,jpeg}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB - for large audio files
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
  };
});
