// API Configuration
// Automatically detects environment and uses appropriate API endpoint

const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : window.location.origin;

// Supabase Configuration
// Get these values from Supabase Dashboard → Settings → API
window.SUPABASE_URL = "https://ngfbtjndmhzgqejwglxb.supabase.co"; // e.g., https://xxxxx.supabase.co
window.SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZmJ0am5kbWh6Z3FlandnbHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzA5NjQsImV4cCI6MjA4NTk0Njk2NH0.FSXtckRyO-ykCbuQq81PNlugWl69320albFHegfjDLE"; // Your project's anon/public key

// Export as global variable for use in other scripts
window.API_BASE_URL = API_BASE_URL;
window.API_CONFIG = {
    baseURL: API_BASE_URL,
    endpoints: {
        users: `${API_BASE_URL}/api/users`,
        products: `${API_BASE_URL}/api/products`,
        favorites: `${API_BASE_URL}/api/favorites`,
        chat: `${API_BASE_URL}/api/chat`,
        uploads: `${API_BASE_URL}/api/uploads`,
        health: `${API_BASE_URL}/api/health`,
        schema: `${API_BASE_URL}/api/db/schema`,
    },
};

console.log("🌍 API Configuration:", window.API_CONFIG);
console.log("🗄️ Supabase URL:", window.SUPABASE_URL);
