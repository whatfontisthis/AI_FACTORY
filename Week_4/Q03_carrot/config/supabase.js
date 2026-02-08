// Supabase Client Configuration
// This is a client-side only file - used in browser

(async function() {
  // Import Supabase from CDN
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

  // Get Supabase credentials from window config
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not found. Realtime features will not work.');
    return;
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

  // Export for global use
  window.supabase = supabase;

  console.log('✅ Supabase client initialized');
  console.log('🔗 Supabase URL:', SUPABASE_URL);
})();
