import rateLimit from 'express-rate-limit';

// If in test environment, disable rate limiting
const isTest = process.env.NODE_ENV === 'test';

const sensitiveLimiter = isTest
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 5,
      message: {
        message: 'Too many requests from this IP, please try again after 10 minutes.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

export default sensitiveLimiter; 