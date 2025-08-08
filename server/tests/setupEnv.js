import { tmpdir } from 'os';
import { join } from 'path';

// Create a unique download directory for mongodb-memory-server per test run
const uniqueMongoDownloadDir = join(
  tmpdir(),
  `mongodb-binaries-${Date.now()}-${Math.random().toString(36).slice(2)}`,
);

process.env.MONGOMS_DOWNLOAD_DIR = uniqueMongoDownloadDir;

