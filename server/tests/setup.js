// Global test setup
import { jest } from '@jest/globals';

// Increase timeout for slow operations
jest.setTimeout(60000);

// Suppress console.warn for MongoDB Memory Server warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific MongoDB Memory Server warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('MongoMemoryServer')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Clean up environment after tests
afterAll(async () => {
  // Give a moment for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});