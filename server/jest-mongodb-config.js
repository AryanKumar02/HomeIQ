export default {
  mongodbMemoryServerOptions: {
    binary: {
      version: '7.0.14',
      skipMD5: true,
      downloadDir: process.env.HOME + '/.cache/mongodb-binaries',
    },
    instance: {
      dbName: 'testdb',
      storageEngine: 'wiredTiger',
    },
    autoStart: false,
  },
};