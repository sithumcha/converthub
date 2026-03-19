const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Standard routes
router.post('/create-checkout-session', protect, createCheckoutSession);

// Webhook needs raw body, handled in index.js specifically for this route
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
