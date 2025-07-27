import path from 'path';
import os from 'os';

// Configure MongoDB Memory Server for CI environments
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';

if (isCI) {
  // Use a unique cache directory to avoid lockfile conflicts
  const cacheDir = path.join(os.tmpdir(), `mongodb-binaries-${process.pid}-${Date.now()}`);
  process.env.MONGOMS_DOWNLOAD_DIR = cacheDir;
  process.env.MONGOMS_ARCHIVE_NAME = 'mongodb-binaries';
  
  // Disable MongoDB Memory Server instance sharing
  process.env.MONGOMS_DISABLE_POSTINSTALL = 'true';
  
  // Configure for CI environment
  process.env.MONGOMS_SYSTEM_BINARY = undefined;
  process.env.MONGOMS_VERSION = '7.0.14';
  
  // Use faster but less isolated mode for CI
  process.env.MONGOMS_USE_SHARED_MEMORY = 'false';
}

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.AWS_REGION = 'us-east-1';