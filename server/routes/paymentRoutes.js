const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Standard routes
router.post('/create-checkout-session', protect, paymentController.createCheckoutSession);
router.post('/cancel-subscription', protect, paymentController.cancelSubscription);

// Webhook needs raw body, handled in index.js specifically for this route
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
