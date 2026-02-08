/**
 * Product Routes
 * Public endpoints for browsing products
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all categories
router.get('/categories', productController.getCategories);

// Get products by category
router.get('/category/:category', productController.getProductsByCategory);

// Get all products (with optional ?category filter)
router.get('/', productController.getAllProducts);

// Get single product by ID
router.get('/:id', productController.getProductById);

module.exports = router;
