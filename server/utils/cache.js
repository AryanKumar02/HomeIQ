import redisClient from '../config/redis.js';

import logger from './logger.js';

/**
 * Cache configuration and utilities
 */

// Cache expiration times (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes - for frequently changing data
  MEDIUM: 900, // 15 minutes - for moderately stable data
  LONG: 3600, // 1 hour - for stable data
  VERY_LONG: 86400, // 24 hours - for very stable data
};

// Cache key prefixes for organization
export const CACHE_KEYS = {
  USER_PROPERTIES: 'properties:user:',
  USER_PROFILE: 'user:profile:',
  PROPERTY_DETAILS: 'property:details:',
  PROPERTY_ANALYTICS: 'analytics:property:user:',
  USER_STORAGE: 'storage:user:',
  TENANT_LIST: 'tenants:user:',
  PROPERTY_UNITS: 'units:property:',
};

/**
 * Generic caching wrapper function
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fetched data
 */
export const cacheWrapper = async (key, fetchFn, ttl = CACHE_TTL.MEDIUM) => {
  try {
    // Try to get data from cache first
    const cached = await redisClient.get(key);

    if (cached) {
      logger.info(`Cache HIT for key: ${key}`);
      return JSON.parse(cached);
    }

    // Cache miss - fetch data
    logger.info(`Cache MISS for key: ${key}`);
    const data = await fetchFn();

    // Store in cache with TTL
    if (data) {
      const success = await redisClient.set(key, JSON.stringify(data), { EX: ttl });
      if (success) {
        logger.info(`Cached data for key: ${key} (TTL: ${ttl}s)`);
      }
    }

    return data;
  } catch (error) {
    logger.error(`Cache wrapper error for key ${key}:`, error.message);
    // Fallback to direct data fetch
    return await fetchFn();
  }
};

/**
 * Cache invalidation utilities
 */
export const invalidateUserCache = async userId => {
  try {
    const patterns = [
      `${CACHE_KEYS.USER_PROPERTIES}${userId}`,
      `${CACHE_KEYS.USER_PROFILE}${userId}`,
      `${CACHE_KEYS.PROPERTY_ANALYTICS}${userId}`,
      `${CACHE_KEYS.USER_STORAGE}${userId}`,
      `${CACHE_KEYS.TENANT_LIST}${userId}`,
    ];

    for (const pattern of patterns) {
      await redisClient.del(pattern);
    }

    logger.info(`Invalidated cache for user: ${userId}`);
  } catch (error) {
    logger.error(`Error invalidating user cache for ${userId}:`, error.message);
  }
};

export const invalidatePropertyCache = async (userId, propertyId = null) => {
  try {
    const keysToDelete = [
      `${CACHE_KEYS.USER_PROPERTIES}${userId}`,
      `${CACHE_KEYS.PROPERTY_ANALYTICS}${userId}`,
    ];

    if (propertyId) {
      keysToDelete.push(
        `${CACHE_KEYS.PROPERTY_DETAILS}${propertyId}`,
        `${CACHE_KEYS.PROPERTY_UNITS}${propertyId}`,
      );
    }

    for (const key of keysToDelete) {
      await redisClient.del(key);
    }

    logger.info(`Invalidated property cache for user: ${userId}, property: ${propertyId || 'all'}`);
  } catch (error) {
    logger.error('Error invalidating property cache:', error.message);
  }
};

export const invalidateTenantCache = async userId => {
  try {
    const keysToDelete = [
      `${CACHE_KEYS.TENANT_LIST}${userId}`,
      `${CACHE_KEYS.PROPERTY_ANALYTICS}${userId}`, // Analytics might include tenant data
    ];

    for (const key of keysToDelete) {
      await redisClient.del(key);
    }

    logger.info(`Invalidated tenant cache for user: ${userId}`);
  } catch (error) {
    logger.error(`Error invalidating tenant cache for ${userId}:`, error.message);
  }
};

/**
 * Middleware to clear cache on data mutations
 */
export const clearCacheMiddleware = cacheType => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to clear cache after successful response
    res.json = function (data) {
      // Only clear cache for successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Clear cache asynchronously (don't block response)
        setImmediate(async () => {
          try {
            const userId = req.user?.id;
            const propertyId = req.params?.id;

            switch (cacheType) {
              case 'property':
                await invalidatePropertyCache(userId, propertyId);
                break;
              case 'user':
                await invalidateUserCache(userId);
                break;
              case 'tenant':
                await invalidateTenantCache(userId);
                break;
              default:
                logger.warn(`Unknown cache type: ${cacheType}`);
            }
          } catch (error) {
            logger.error('Cache clearing error in middleware:', error.message);
          }
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Express middleware for caching GET requests
 */
export const cacheMiddleware = (keyGenerator, ttl = CACHE_TTL.MEDIUM) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = typeof keyGenerator === 'function' ? keyGenerator(req) : keyGenerator;

      const cached = await redisClient.get(cacheKey);

      if (cached) {
        logger.info(`Cache HIT for middleware key: ${cacheKey}`);
        const data = JSON.parse(cached);
        return res.status(200).json(data);
      }

      logger.info(`Cache MISS for middleware key: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache successful responses
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setImmediate(async () => {
            try {
              await redisClient.set(cacheKey, JSON.stringify(data), { EX: ttl });
              logger.info(`Cached response for key: ${cacheKey} (TTL: ${ttl}s)`);
            } catch (error) {
              logger.error(`Error caching response for key ${cacheKey}:`, error.message);
            }
          });
        }

        return originalJson.call(this, data);
      };
    } catch (error) {
      logger.error('Cache middleware error:', error.message);
    }

    next();
  };
};

/**
 * Health check for cache system
 */
export const getCacheHealth = async () => {
  return await redisClient.healthCheck();
};
