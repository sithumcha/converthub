require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const queue = require('./config/queue');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const imageRoutes = require('./routes/imageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// ✅ Complete Helmet Configuration - Allow blob: URLs for downloads
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "blob:"],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "blob:"],  // ✅ CRITICAL: Allow blob: in script-src-elem
        styleSrc: ["'self'", "'unsafe-inline'"],
        styleSrcElem: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https://api.remove.bg", "https://*.upstash.io"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

app.use(morgan('dev'));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(require('./config/cors'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/converted', express.static(path.join(__dirname, 'converted')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ConvertHub Server is running' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });