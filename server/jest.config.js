export default {
  testEnvironment: 'node',
  transform: {},
  // Run tests sequentially to avoid MongoDB Memory Server lockfile conflicts
  maxWorkers: 1,
  // Increase timeout for MongoDB Memory Server setup
  testTimeout: 60000,
  // Setup and teardown files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // Add any other Jest configurations you might need here
  // For example, to collect coverage:
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // coverageReporters: ["json", "lcov", "text", "clover"],
  // collectCoverageFrom: [
  //   "**/*.js",
  //   "!**/node_modules/**",
  //   "!**/vendor/**",
  //   "!**/coverage/**",
  //   "!jest.config.js",
  //   "!server.js", // Or any other specific files to ignore
  //   "!**/utils/logger.js", // Might not want to cover basic logger setup
  //   "!**/tests/**" // Don't collect coverage from tests themselves
  // ]
};
