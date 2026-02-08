-- Cleanup tables (keep user_profiles)
-- Truncate all tables except user profiles

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Truncate tables (cascade to handle dependencies)
TRUNCATE TABLE carrot_notifications CASCADE;
TRUNCATE TABLE carrot_chat_messages CASCADE;
TRUNCATE TABLE carrot_chat_rooms CASCADE;
TRUNCATE TABLE carrot_favorites CASCADE;
TRUNCATE TABLE carrot_products CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify remaining data
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
SELECT 'notifications', COUNT(*) FROM carrot_notifications;
