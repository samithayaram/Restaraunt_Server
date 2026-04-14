const express = require('express');
const { createCheckoutSession, dummyCheckout, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/dummy-checkout', protect, dummyCheckout);

// Webhook requires raw body parsing; this should typically be mounted in server.js before express.json()
// Alternatively handled via separate route with express.raw()

module.exports = router;
