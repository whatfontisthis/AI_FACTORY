/**
 * Payment & Order Routes
 * Handles checkout, Toss Payments, and order management
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateJWT } = require('../middleware/auth');

// Checkout (create order) - requires auth
router.post('/checkout/create', authenticateJWT, paymentController.createCheckout);

// Confirm Toss payment - requires auth
router.post('/payment/toss/confirm', authenticateJWT, paymentController.confirmTossPayment);

// Toss webhook - public endpoint (Toss will call this)
router.post('/payment/webhook', paymentController.handleWebhook);

// Get order details - requires auth
router.get('/orders/:id', authenticateJWT, paymentController.getOrder);

// Get order history - requires auth
router.get('/orders', authenticateJWT, paymentController.getOrders);

module.exports = router;
