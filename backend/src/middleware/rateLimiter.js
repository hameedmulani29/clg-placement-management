const rateLimit = require('express-rate-limit');

/**
 * Sensitive endpoints rate limiter (Login, Student Registration)
 * Allows up to 30 requests per 15-minute window per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => process.env.NODE_ENV === 'test', // Bypass in test suite
});

/**
 * General API rate limiter
 * Allows up to 300 requests per 15-minute window per IP
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many API requests from this IP. Please slow down and try again later.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = {
  authRateLimiter,
  apiRateLimiter,
};
