import fs from 'fs';
import path from 'path';
import os from 'os';

import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  // Clean up any existing lockfiles from previous runs
  const cacheDir =
    process.env.MONGOMS_DOWNLOAD_DIR || path.join(os.homedir(), '.cache', 'mongodb-binaries');

  try {
    // Remove any existing lockfiles
    const files = fs.readdirSync(cacheDir).filter(file => file.endsWith('.lock'));
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(cacheDir, file));
        console.log(`Cleaned up lockfile: ${file}`);
      } catch (err) {
        console.warn(`Could not remove lockfile ${file}:`, err.message);
      }
    }
  } catch (err) {
    // Cache directory doesn't exist yet, that's fine
  }

  // Create a global MongoDB instance for all tests
  const mongod = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
      downloadDir: cacheDir,
    },
    instance: {
      port: 27017 + Math.floor(Math.random() * 1000), // Random port to avoid conflicts
      dbName: 'homeiq-test',
    },
  });

  const uri = mongod.getUri();

  // Store the instance reference and URI globally
  global.__MONGOD__ = mongod;
  process.env.MONGODB_URI = uri;

  console.log(`MongoDB Memory Server started at: ${uri}`);
}
