import crypto from 'crypto';

import logger from '../utils/logger.js';

// CSRF protection middleware for cookie-based operations
export const csrfProtection = (req, res, next) => {
  // Skip CSRF protection for test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Skip for safe HTTP methods
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // Skip for authentication routes that don't use cookies for state
  if (req.path.includes('/auth/')) {
    return next();
  }

  // For JWT-based API requests, validate origin/referer
  const origin = req.get('Origin');
  const referer = req.get('Referer');

  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL, // Add the correct env var
    'https://estate-link-six.vercel.app', // Your Vercel frontend
    'https://estatelink.live', // Your custom domain frontend
  ].filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    logger.debug?.(`CSRF check - Origin: ${origin || 'none'}`);
    logger.debug?.(`CSRF check - Referer: ${referer || 'none'}`);
  }

  const hasValidOrigin = origin && allowedOrigins.includes(origin);
  const hasValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

  if (process.env.NODE_ENV !== 'production') {
    logger.debug?.(`CSRF check - Valid origin: ${hasValidOrigin}`);
    logger.debug?.(`CSRF check - Valid referer: ${hasValidReferer}`);
  }

  // For API requests with cookies, require valid origin
  if (req.cookies && Object.keys(req.cookies).length > 0) {
    if (!hasValidOrigin && !hasValidReferer) {
      logger.warn(
        `CSRF: Invalid origin/referer for cookie request from IP: ${req.ip}, Origin: ${origin}, Referer: ${referer}`,
      );
      return res.status(403).json({
        error: 'Request not allowed from this origin',
      });
    }
  }

  // Additional validation for JSON API requests
  const contentType = req.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    if (!hasValidOrigin && !hasValidReferer) {
      logger.warn(
        `CSRF: Invalid origin/referer for JSON request from IP: ${req.ip}, Origin: ${origin}, Referer: ${referer}`,
      );
      return res.status(403).json({
        error: 'Request not allowed from this origin',
      });
    }
  }

  next();
};

// Generate CSRF token for additional protection if needed
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token
export const validateCSRFToken = (token, sessionToken) => {
  if (!token || !sessionToken) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
};
