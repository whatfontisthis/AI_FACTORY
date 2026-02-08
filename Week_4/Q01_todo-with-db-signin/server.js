require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Simple in-memory session store (for demo purposes)
const sessions = new Map();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve index.html for root route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token || !sessions.has(token)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = sessions.get(token);
    next();
}

// Initialize users table and default admin user
async function initUsersTable() {
    try {
        console.log("🔄 Initializing database...");
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS week4_users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Users table ready");

        // Check if admin user exists
        const result = await pool.query(
            "SELECT * FROM week4_users WHERE username = $1",
            ["admin"]
        );

        if (result.rows.length === 0) {
            // Insert default admin user
            await pool.query(
                "INSERT INTO week4_users (username, password) VALUES ($1, $2)",
                ["admin", "123456"]
            );
            console.log("✅ Default admin user created (admin/123456)");
        } else {
            console.log("✅ Admin user already exists");
        }
    } catch (error) {
        console.error("❌ Error initializing users table:", error);
        console.error("Error details:", error.message);
    }
}

// Initialize on startup (but don't block)
initUsersTable().catch(err => console.error("Init failed:", err));

// Auth Routes

// POST /api/signup - Create new user
app.post("/api/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: "Username and password required" });
    }

    if (username.length < 3) {
        return res
            .status(400)
            .json({ error: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
        return res
            .status(400)
            .json({ error: "Password must be at least 6 characters" });
    }

    try {
        // Check if username already exists
        const existingUser = await pool.query(
            "SELECT * FROM week4_users WHERE username = $1",
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        // Insert new user
        const result = await pool.query(
            "INSERT INTO week4_users (username, password) VALUES ($1, $2) RETURNING id, username",
            [username, password]
        );

        // Generate session token
        const token = crypto.randomBytes(32).toString("hex");
        sessions.set(token, {
            id: result.rows[0].id,
            username: result.rows[0].username,
        });

        res.status(201).json({ token, username: result.rows[0].username });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ error: "Signup failed" });
    }
});

// POST /api/login - Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    console.log("🔐 Login attempt for user:", username);

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: "Username and password required" });
    }

    try {
        console.log("📊 Querying database...");
        const result = await pool.query(
            "SELECT * FROM week4_users WHERE username = $1 AND password = $2",
            [username, password]
        );

        console.log("📊 Query result:", result.rows.length, "users found");

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate session token
        const token = crypto.randomBytes(32).toString("hex");
        sessions.set(token, {
            id: result.rows[0].id,
            username: result.rows[0].username,
        });

        console.log("✅ Login successful for:", username);
        res.json({ token, username: result.rows[0].username });
    } catch (error) {
        console.error("❌ Error during login:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Login failed: " + error.message });
    }
});

// POST /api/logout - Logout
app.post("/api/logout", (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
        sessions.delete(token);
    }
    res.json({ message: "Logged out successfully" });
});

// GET /api/me - Get current user
app.get("/api/me", authMiddleware, (req, res) => {
    res.json({ username: req.user.username });
});

// API Routes

// GET /api/todos - Get all todos for current user
app.get("/api/todos", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM week4_todos WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

// POST /api/todos - Create a new todo
app.post("/api/todos", authMiddleware, async (req, res) => {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const result = await pool.query(
            "INSERT INTO week4_todos (user_id, title, completed) VALUES ($1, $2, FALSE) RETURNING *",
            [req.user.id, title.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating todo:", error);
        res.status(500).json({ error: "Failed to create todo" });
    }
});

// PATCH /api/todos/:id - Toggle todo completion status
app.patch("/api/todos/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "UPDATE week4_todos SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error toggling todo:", error);
        res.status(500).json({ error: "Failed to toggle todo" });
    }
});

// DELETE /api/todos/:id - Delete a todo
app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM week4_todos WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json({
            message: "Todo deleted successfully",
            deletedTodo: result.rows[0],
        });
    } catch (error) {
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

// Start server
if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n👋 Shutting down gracefully...");
    await pool.end();
    process.exit(0);
});

// Export for Vercel
module.exports = app;
