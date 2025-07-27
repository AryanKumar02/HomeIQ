export default async function globalTeardown() {
  // Stop the global MongoDB instance
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
    console.log('MongoDB Memory Server stopped');
  }

  // Clean up any remaining lockfiles
  const path = await import('path');
  const fs = await import('fs');
  const os = await import('os');

  const cacheDir =
    process.env.MONGOMS_DOWNLOAD_DIR || path.join(os.homedir(), '.cache', 'mongodb-binaries');

  try {
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
    // Cache directory doesn't exist, that's fine
  }
}
