const rateLimit = require('express-rate-limit');

// General API rate limiter for all users based on IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes',
      status: 429
    }
  }
});

// Stricter rate limiter for heavy tasks like AI and File Conversions
const heavyTaskLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 heavy requests per hour
  message: {
    error: {
      message: 'Too many file processing requests, please try again after an hour or upgrade to PRO',
      status: 429
    }
  }
});

module.exports = {
  apiLimiter,
  heavyTaskLimiter
};
