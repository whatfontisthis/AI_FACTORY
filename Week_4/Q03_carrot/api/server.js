const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// Firebase Admin SDK 초기화
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized');
    } else {
      console.warn('⚠️ Firebase Admin SDK not initialized: No service account key');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin SDK initialization error:', error.message);
  }
}

// PostgreSQL 연결 풀
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Firebase 인증 미들웨어
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Optional 인증 미들웨어
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          email_verified: decodedToken.email_verified
        };
      } catch (error) {
        console.warn('Optional auth failed:', error.message);
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// ==================== User Profile API Routes ====================

// 프로필 조회 (GET /api/users/:uid)
app.get('/api/users/:uid', optionalAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await pool.query(
      'SELECT * FROM carrot_user_profiles WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// 프로필 생성/업데이트 (POST /api/users)
app.post('/api/users', authenticateUser, async (req, res) => {
  try {
    const { nickname, region, profile_image_url } = req.body;
    const { uid, email } = req.user;

    const result = await pool.query(
      `INSERT INTO carrot_user_profiles (firebase_uid, email, nickname, region, profile_image_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (firebase_uid)
       DO UPDATE SET
         nickname = EXCLUDED.nickname,
         region = EXCLUDED.region,
         profile_image_url = EXCLUDED.profile_image_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [uid, email, nickname, region, profile_image_url]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update user profile'
    });
  }
});

// 프로필 업데이트 (PATCH /api/users/:uid)
app.patch('/api/users/:uid', authenticateUser, async (req, res) => {
  try {
    const { uid } = req.params;
    if (req.user.uid !== uid) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this profile'
      });
    }

    const { nickname, region, profile_image_url } = req.body;
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nickname !== undefined) {
      updates.push(`nickname = $${paramCount++}`);
      values.push(nickname);
    }
    if (region !== undefined) {
      updates.push(`region = $${paramCount++}`);
      values.push(region);
    }
    if (profile_image_url !== undefined) {
      updates.push(`profile_image_url = $${paramCount++}`);
      values.push(profile_image_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(uid);
    const query = `
      UPDATE carrot_user_profiles
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE firebase_uid = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// 프로필 삭제 (DELETE /api/users/:uid)
app.delete('/api/users/:uid', authenticateUser, async (req, res) => {
  try {
    const { uid } = req.params;
    if (req.user.uid !== uid) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this profile'
      });
    }

    const result = await pool.query(
      'DELETE FROM carrot_user_profiles WHERE firebase_uid = $1 RETURNING *',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user profile'
    });
  }
});

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== Database Schema Info ====================
app.get('/api/db/schema', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'carrot_user_profiles'
      ORDER BY ordinal_position
    `);

    res.json({
      success: true,
      table: 'carrot_user_profiles',
      columns: result.rows
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database schema'
    });
  }
});

module.exports = app;
