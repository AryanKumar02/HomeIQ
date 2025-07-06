import crypto from 'crypto';
import logger from '../utils/logger.js';

// Simple CSRF protection middleware
// For state-changing operations, we'll validate that requests include a proper token
export const csrfProtection = (req, res, next) => {
  // Skip CSRF protection for test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Skip for GET requests as they should be idempotent
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  // For authenticated API requests, we'll use the JWT token itself as anti-CSRF protection
  // since SPAs don't suffer from traditional CSRF when using proper token storage
  // But we'll add additional header validation for extra security
  
  const contentType = req.get('Content-Type');
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // Validate content type for API requests
  if (!contentType || !contentType.includes('application/json')) {
    logger.warn(`CSRF: Invalid content type from IP: ${req.ip}, Content-Type: ${contentType}`);
    return res.status(403).json({
      error: 'Invalid request format',
    });
  }

  // Validate origin/referer for additional protection
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const hasValidOrigin = origin && allowedOrigins.includes(origin);
  const hasValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

  if (!hasValidOrigin && !hasValidReferer) {
    logger.warn(`CSRF: Invalid origin/referer from IP: ${req.ip}, Origin: ${origin}, Referer: ${referer}`);
    return res.status(403).json({
      error: 'Request not allowed from this origin',
    });
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