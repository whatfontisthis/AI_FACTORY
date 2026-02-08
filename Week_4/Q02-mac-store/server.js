/**
 * Mac Shopping Website - Express Server
 * CDN-based React + Express 5 + PostgreSQL + Firebase Auth + Toss Payments
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import routes
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://mac-store-shop.vercel.app',
        'https://mac-store-shop-mahxugerr-woobin-lees-projects.vercel.app',
        /https:\/\/mac-store-shop-.*\.vercel\.app$/
      ]
    : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers - Allow Firebase and Toss Payments popups
app.use((req, res, next) => {
  // Allow popups for Firebase auth and Toss Payments
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    firebase: {
      configured: !!process.env.FIREBASE_PROJECT_ID,
      projectId: process.env.FIREBASE_PROJECT_ID || 'not set',
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0
    },
    database: {
      configured: !!process.env.DATABASE_URL
    }
  });
});

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', paymentRoutes); // Handles /api/checkout, /api/payment, /api/orders

// Catch-all route - serve index.html for SPA routing
app.use((req, res, next) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('🚀 ============================================');
  console.log(`🛍️  Mac Shopping Website Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ============================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
