/**
 * PostgreSQL Database Connection
 * Uses Supabase hosted PostgreSQL
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  },
  // Connection pool settings
  max: 20, // Maximum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`🗄️  Executed query in ${duration}ms:`, text.substring(0, 50));
    return res;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
};

// Helper function to get a client from the pool (for transactions)
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 5 seconds for each transaction
  const timeout = setTimeout(() => {
    console.error('⚠️  A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the release method to clear our timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool,
};
