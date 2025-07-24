import { createClient } from 'redis';

import logger from '../utils/logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Redis configuration with fallback to default localhost
      const redisConfig = {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: retries => {
            if (retries >= 10) {
              logger.error('Redis max reconnection attempts reached');
              return false;
            }
            // Exponential backoff: 2^retries * 100ms, max 3 seconds
            const delay = Math.min(Math.pow(2, retries) * 100, 3000);
            logger.info(`Redis reconnecting in ${delay}ms (attempt ${retries + 1})`);
            return delay;
          },
        },
      };

      this.client = createClient(redisConfig);

      // Event listeners
      this.client.on('connect', () => {
        logger.info('Redis client connected');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('Redis client ready');
      });

      this.client.on('error', err => {
        this.isConnected = false;
        logger.error('Redis client error:', err);
      });

      this.client.on('end', () => {
        this.isConnected = false;
        logger.warn('Redis client connection ended');
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });

      // Connect to Redis
      await this.client.connect();

      // Test connection
      await this.client.ping();
      logger.info('Redis connection established successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to Redis:', error.message);

      // Don't throw error - allow app to continue without Redis
      logger.warn('Application will continue without Redis caching');
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        logger.info('Redis client disconnected gracefully');
      }
    } catch (error) {
      logger.error('Error disconnecting Redis:', error.message);
    }
  }

  // Safe wrapper methods that handle Redis unavailability
  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key, value, options = {}) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      await this.client.set(key, value, options);
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error.message);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error.message);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
      return true;
    } catch (error) {
      logger.error(`Redis DEL pattern error for pattern ${pattern}:`, error.message);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error.message);
      return false;
    }
  }

  async ttl(key) {
    try {
      if (!this.isConnected || !this.client) {
        return -1;
      }
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL error for key ${key}:`, error.message);
      return -1;
    }
  }

  // Utility method to check if Redis is available
  isAvailable() {
    return this.isConnected && this.client;
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.isConnected || !this.client) {
        return { status: 'disconnected', message: 'Redis client not connected' };
      }

      const start = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
        message: 'Redis is responding to ping',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing Redis connection...');
  await redisClient.disconnect();
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing Redis connection...');
  await redisClient.disconnect();
});

export default redisClient;
