const cors = require('cors');

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',                    // Local development
  'http://localhost:3000',                     // Alternative local
  'https://converthub-2026.netlify.app',                    // Production frontend URL
  process.env.FRONTEND_URL2,                    // Backup domain if any
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('🚫 Blocked CORS request from:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                          // Allow cookies/auth headers
  optionsSuccessStatus: 200,                   // Legacy browsers support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
};

// Dynamic CORS for production vs development
const corsMiddleware = (req, res, next) => {
  // In development, allow all
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    return next();
  }

  // In production, use strict CORS
  cors(corsOptions)(req, res, next);
};

module.exports = corsMiddleware;
