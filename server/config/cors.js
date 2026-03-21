// const cors = require('cors');

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:3000',
//   'https://converthub-2026.netlify.app',
//   'https://converthub-six.vercel.app'
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.log('Blocked CORS request from:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },

//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
//   exposedHeaders: ['Content-Disposition']
// };

// module.exports = cors(corsOptions);


const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://converthub-2026.netlify.app',
  'https://converthub-six.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked CORS request from:', origin);
      callback(null, true);  // ✅ Allow anyway for testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Content-Disposition']
};

module.exports = cors(corsOptions);