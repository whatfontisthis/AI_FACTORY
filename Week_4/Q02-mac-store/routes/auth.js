/**
 * Authentication Routes
 * Firebase token verification and JWT issuance
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

// Verify Firebase token and issue JWT
router.post('/firebase', authController.verifyFirebaseToken);

// Verify JWT token (protected route for testing)
router.get('/verify', authenticateJWT, authController.verifyJWT);

module.exports = router;
