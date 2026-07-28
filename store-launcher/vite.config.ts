/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    VitePWA({ registerType: 'autoUpdate' })
  ],
  server: {
    proxy: {
      '/shopify-api': {
        target: 'https://myshopify.com',
        changeOrigin: true,
        secure: false,
        router: (req) => {
          const storeDomain = req.headers['x-shopify-domain'];
          return storeDomain ? `https://${storeDomain}` : 'https://myshopify.com';
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const storeDomain = req.headers['x-shopify-domain'];
            if (storeDomain) {
              proxyReq.setHeader('Host', storeDomain as string);
            }
          });
        },
        rewrite: (path) => path.replace(/^\/shopify-api/, ''),
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
