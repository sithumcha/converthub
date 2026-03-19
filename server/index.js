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

// Middlewares
app.use(helmet());
app.use(morgan('dev'));

// Stripe webhook needs raw body, we handle it by placing it BEFORE express.json() 
// with a check for the route, OR just using express.json() everywhere else.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(require('./config/cors'));

// Static folders for uploads and converted files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/converted', express.static(path.join(__dirname, 'converted')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/images', imageRoutes);

app.use('/api/payments', paymentRoutes);


// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ConvertHub Server is running' });
});

// Database connection
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
