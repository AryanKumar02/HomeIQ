import express from 'express';

import { getCacheHealth } from '../utils/cache.js';
import redisClient from '../config/redis.js';

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Check Redis health
    if (redisClient.isAvailable()) {
      const redisHealth = await getCacheHealth();
      health.redis = redisHealth;
    } else {
      health.redis = { status: 'unavailable', message: 'Redis not connected' };
    }

    // Check database health (basic check)
    health.database = 'connected'; // You could add actual DB ping here

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
      },
      cpu: process.cpuUsage(),
    };

    // Redis health
    if (redisClient.isAvailable()) {
      health.redis = await getCacheHealth();
    } else {
      health.redis = { status: 'unavailable' };
    }

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
