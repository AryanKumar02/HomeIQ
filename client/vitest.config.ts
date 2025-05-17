import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,               // allow `describe/it` without imports
    environment: 'jsdom',        // simulate browser APIs
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'lcov'], // console + lcov report
      all: true,                  // collect coverage for all files
      include: ['src/**/*.{ts,tsx}']
    }
  }
})