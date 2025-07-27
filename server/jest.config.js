export default {
  testEnvironment: 'node',
  transform: {},
  // Environment setup before tests
  setupFiles: ['<rootDir>/tests/setup.js'],
  // Increase timeout for MongoDB operations
  testTimeout: 30000,
  // Run tests in sequence to avoid MongoDB lockfile conflicts
  maxWorkers: 1,
  // Force exit after tests complete
  forceExit: true,
  // Clear mocks between tests
  clearMocks: true,
  // Collect coverage
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!server.js",
    "!**/utils/logger.js",
    "!**/tests/**"
  ],
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js'
};
