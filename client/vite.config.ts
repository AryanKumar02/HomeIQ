import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { default as compression } from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA Service Worker
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit (WebP will be smaller)
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              // Cache all API calls regardless of origin (dev/prod)
              return url.pathname.startsWith('/api/')
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 150, // More images since they're smaller
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'HomeIQ Property Management',
        short_name: 'HomeIQ',
        description: 'Property management made simple',
        theme_color: '#036CA3',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/assets/logo.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/assets/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
    // Enable compression for both dev and production
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enable compression and minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
        passes: 3, // Run more passes for better compression
        // pure_funcs: ['console.log', 'console.warn', 'console.error'], // Keep console methods for debugging
        dead_code: true,
        unused: true,
        reduce_vars: true,
        collapse_vars: true,
        join_vars: true,
        sequences: true,
        side_effects: false,
      },
      mangle: {
        safari10: true, // Fix Safari 10 issues
        toplevel: true, // Mangle top-level names
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Keep emotion and MUI together to prevent initialization issues
          'mui-emotion': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'query': ['@tanstack/react-query'],
        },
        // Optimize chunk and asset naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.names || assetInfo.names.length === 0) {
            return 'assets/[name]-[hash][extname]'
          }
          const name = assetInfo.names[0]
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500, // Lower limit to catch large chunks
    // Enable sourcemaps for production debugging (optional)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020', // More modern target for better optimization
    // Additional optimizations
    cssCodeSplit: true, // Split CSS into separate files
    assetsInlineLimit: 8192, // Inline more small assets (8KB instead of 4KB)
    reportCompressedSize: false, // Faster builds
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is',
      'prop-types',
      '@mui/material',
      '@mui/material/styles',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: [
      '@mui/icons-material', // Don't pre-bundle icons to reduce initial bundle
    ],
    esbuildOptions: {
      // Define prop-types as external to avoid bundling issues
      define: {
        global: 'globalThis',
      },
    },
  },
  // Enable tree-shaking
  esbuild: {
    drop: ['debugger'], // Keep console.log for debugging, remove debugger
    legalComments: 'none', // Remove license comments
    treeShaking: true,
    // Fix emotion bundling issues
    keepNames: true,
    // Fix prop-types compatibility with React 19
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
  },
  // Enable CSS tree-shaking and optimization
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // Add CSS optimization plugins if needed
      ],
    },
  },
  // More aggressive dependency optimization
  resolve: {
    alias: {
      // Alias for smaller lodash imports if used
      'lodash': 'lodash-es',
      // Fix React 19 compatibility issues
      'react-is': 'react-is',
    },
  },
})
