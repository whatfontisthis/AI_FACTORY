// Cleanup database tables (except user_profiles)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  const client = await pool.connect();

  try {
    console.log('🗑️  Starting cleanup...\n');

    // Disable foreign key checks
    await client.query("SET session_replication_role = 'replica'");

    // Truncate tables
    console.log('Truncating carrot_notifications...');
    await client.query('TRUNCATE TABLE carrot_notifications CASCADE');

    console.log('Truncating carrot_chat_messages...');
    await client.query('TRUNCATE TABLE carrot_chat_messages CASCADE');

    console.log('Truncating carrot_chat_rooms...');
    await client.query('TRUNCATE TABLE carrot_chat_rooms CASCADE');

    console.log('Truncating carrot_favorites...');
    await client.query('TRUNCATE TABLE carrot_favorites CASCADE');

    console.log('Truncating carrot_products...');
    await client.query('TRUNCATE TABLE carrot_products CASCADE');

    // Re-enable foreign key checks
    await client.query("SET session_replication_role = 'origin'");

    console.log('\n✅ Cleanup completed!\n');

    // Verify
    console.log('📊 Remaining data:\n');
    const result = await client.query(`
      SELECT 'user_profiles' as table_name, COUNT(*) as count FROM carrot_user_profiles
      UNION ALL
      SELECT 'products', COUNT(*) FROM carrot_products
      UNION ALL
      SELECT 'favorites', COUNT(*) FROM carrot_favorites
      UNION ALL
      SELECT 'chat_rooms', COUNT(*) FROM carrot_chat_rooms
      UNION ALL
      SELECT 'chat_messages', COUNT(*) FROM carrot_chat_messages
      UNION ALL
      SELECT 'notifications', COUNT(*) FROM carrot_notifications
      ORDER BY table_name
    `);

    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
