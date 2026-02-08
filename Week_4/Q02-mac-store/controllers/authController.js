/**
 * Authentication Controller
 * Handles Firebase token verification and JWT issuance
 */

const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } else {
    console.warn('⚠️  Firebase credentials not configured');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}

/**
 * Verify Firebase token and issue JWT
 * POST /api/auth/firebase
 * Body: { idToken: "firebase_id_token" }
 */
exports.verifyFirebaseToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'Firebase ID token is required'
      });
    }

    if (!firebaseInitialized) {
      return res.status(500).json({
        error: 'Firebase authentication not configured on server'
      });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const {
      uid: firebaseUid,
      email,
      name,
      picture: photoUrl
    } = decodedToken;

    // Check if user exists in database
    let userResult = await db.query(
      'SELECT * FROM w4q2_users WHERE firebase_uid = $1',
      [firebaseUid]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await db.query(
        `INSERT INTO w4q2_users (firebase_uid, email, name, photo_url, last_login)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, firebase_uid, email, name, photo_url, created_at`,
        [firebaseUid, email, name || '', photoUrl || '']
      );
      user = insertResult.rows[0];
      console.log('✅ New user created:', email);
    } else {
      // Update last login
      await db.query(
        'UPDATE w4q2_users SET last_login = NOW() WHERE firebase_uid = $1',
        [firebaseUid]
      );
      user = userResult.rows[0];
      console.log('✅ User login:', email);
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        firebaseUid: user.firebase_uid
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo_url: user.photo_url
      }
    });
  } catch (error) {
    console.error('Auth error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Firebase token expired'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        error: 'Invalid Firebase token'
      });
    }

    next(error);
  }
};

/**
 * Verify JWT token and return full user profile
 * GET /api/auth/verify
 */
exports.verifyJWT = async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, email, name, photo_url FROM w4q2_users WHERE id = $1',
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo_url: user.photo_url
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
};
