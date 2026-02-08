/**
 * Cart Routes
 * All routes require authentication
 */

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateJWT } = require('../middleware/auth');

// All cart routes require authentication
router.use(authenticateJWT);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', cartController.addItem);

// Update cart item quantity
router.patch('/update/:id', cartController.updateItem);

// Remove item from cart
router.delete('/remove/:id', cartController.removeItem);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

module.exports = router;
