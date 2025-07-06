import rateLimit from 'express-rate-limit';

import logger from '../utils/logger.js';

// If in test environment, disable rate limiting
const isTest = process.env.NODE_ENV === 'test';

// General rate limiter for API routes
export const generalLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
          error: 'Too many requests from this IP, please try again later.',
        });
      },
    });

// Strict rate limiter for data modification routes (POST, PUT, DELETE)
export const strictLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20, // limit each IP to 20 requests per windowMs
      message: {
        error: 'Too many modification requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(
          `Strict rate limit exceeded for IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}`,
        );
        res.status(429).json({
          error: 'Too many modification requests from this IP, please try again later.',
        });
      },
    });

// Upload rate limiter for file uploads
export const uploadLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 50, // limit each IP to 50 upload requests per hour
      message: {
        error: 'Too many upload requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Upload rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
          error: 'Too many upload requests from this IP, please try again later.',
        });
      },
    });

// Search rate limiter for search operations
export const searchLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // limit each IP to 30 search requests per minute
      message: {
        error: 'Too many search requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.warn(`Search rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
          error: 'Too many search requests from this IP, please try again later.',
        });
      },
    });

// Legacy sensitive limiter for backward compatibility
const sensitiveLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 5,
      message: {
        message: 'Too many requests from this IP, please try again after 10 minutes.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

export default sensitiveLimiter;
