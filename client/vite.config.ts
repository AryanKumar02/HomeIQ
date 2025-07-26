import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { default as compression } from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
        manualChunks: (id) => {
          // More granular chunking to reduce unused code
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-core'
            }
            // Router
            if (id.includes('react-router')) {
              return 'router'
            }
            // Material-UI core (only what's used)
            if (id.includes('@mui/material')) {
              return 'mui-core'
            }
            // Material-UI icons (separate chunk)
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons'
            }
            // Emotion (bundle together to avoid initialization issues)
            if (id.includes('@emotion')) {
              return 'emotion'
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }
            // GSAP
            if (id.includes('gsap')) {
              return 'animation'
            }
            // Zustand
            if (id.includes('zustand')) {
              return 'state'
            }
            // Other vendors
            return 'vendor'
          }
        },
        // Optimize chunk and asset naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name!)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name!)) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
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
    assetsInlineLimit: 4096, // Inline small assets
    reportCompressedSize: false, // Faster builds
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  // Enable tree-shaking
  esbuild: {
    drop: ['debugger'], // Keep console.log for debugging, remove debugger
    legalComments: 'none', // Remove license comments
    treeShaking: true,
    // Fix emotion bundling issues
    keepNames: true,
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
    },
  },
})
