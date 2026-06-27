require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const queue = require('./config/queue');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const logger = require('./utils/logger');
const { initCronJobs } = require('./utils/cronJobs');
const socket = require('./socket');
const http = require('http');

const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/authRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const imageRoutes = require('./routes/imageRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const extraRoutes = require('./routes/extraRoutes');
const batchRoutes = require('./routes/batchRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socket.init(server);

app.use(helmet());
app.use(morgan('dev'));

// Apply global API rate limit
app.use('/api/', apiLimiter);

// Initialize background tasks
initCronJobs();

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
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/extra', extraRoutes);
app.use('/api/batch', batchRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ConvertHub Server is running' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method });
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', { error: err });
  });