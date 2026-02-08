// Vercel Serverless Function Entry Point
// This wraps the Express app for Vercel deployment

// Import Express app from root server.js (without WebSocket)
const app = require('../server');

module.exports = app;
