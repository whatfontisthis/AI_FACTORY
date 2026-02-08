const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Firebase Admin SDK 초기화
try {
  // Firebase 서비스 계정 키 파일이 있는 경우
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // 기본 자격 증명 사용 (로컬 개발 환경)
    admin.initializeApp();
  }
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.warn('⚠️ Firebase Admin SDK not initialized:', error.message);
  console.warn('⚠️ Authentication middleware will be disabled');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 정적 파일 제공
app.use('/uploads', express.static('uploads')); // 업로드된 이미지 제공

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

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified
      };
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Optional 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
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
        console.warn('Optional auth token verification failed:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// 업로드 폴더 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('✅ Successfully connected to PostgreSQL database');
    release();
  }
});

// Initialize database schema function
async function initializeDatabase() {
  try {
    // User profiles table
    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS carrot_user_profiles (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(128) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        nickname VARCHAR(50) NOT NULL,
        profile_image_url TEXT,
        bio TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address TEXT,
        preferences JSONB,
        manner_temp DECIMAL(4, 1) DEFAULT 36.5,
        total_sales INTEGER DEFAULT 0,
        total_purchases INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_carrot_user_profiles_firebase_uid ON carrot_user_profiles(firebase_uid);
      CREATE INDEX IF NOT EXISTS idx_carrot_user_profiles_email ON carrot_user_profiles(email);
      CREATE INDEX IF NOT EXISTS idx_carrot_user_profiles_nickname ON carrot_user_profiles(nickname);
      CREATE INDEX IF NOT EXISTS idx_carrot_user_profiles_location ON carrot_user_profiles(latitude, longitude);
    `;

    // Products table
    const createProductsTableQuery = `
      CREATE TABLE IF NOT EXISTS carrot_products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        description TEXT NOT NULL,
        location VARCHAR(100) DEFAULT '내 동네',
        images JSONB NOT NULL DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'active',
        user_id INTEGER NOT NULL,
        chat_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_carrot_products_category ON carrot_products(category);
      CREATE INDEX IF NOT EXISTS idx_carrot_products_user_id ON carrot_products(user_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_products_status ON carrot_products(status);
      CREATE INDEX IF NOT EXISTS idx_carrot_products_created_at ON carrot_products(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_carrot_products_title ON carrot_products USING gin(to_tsvector('simple', title));
    `;

    // Favorites table
    const createFavoritesTableQuery = `
      CREATE TABLE IF NOT EXISTS carrot_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );

      CREATE INDEX IF NOT EXISTS idx_carrot_favorites_user_id ON carrot_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_favorites_product_id ON carrot_favorites(product_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_favorites_created_at ON carrot_favorites(created_at DESC);
    `;

    // Chat rooms table
    const createChatRoomsTableQuery = `
      CREATE TABLE IF NOT EXISTS carrot_chat_rooms (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        product_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_carrot_chat_rooms_user1 ON carrot_chat_rooms(user1_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_rooms_user2 ON carrot_chat_rooms(user2_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_rooms_product ON carrot_chat_rooms(product_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_rooms_updated ON carrot_chat_rooms(updated_at DESC);
    `;

    // Chat messages table
    const createChatMessagesTableQuery = `
      CREATE TABLE IF NOT EXISTS carrot_chat_messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_carrot_chat_messages_room ON carrot_chat_messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_messages_sender ON carrot_chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_messages_created ON carrot_chat_messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_messages_is_read ON carrot_chat_messages(is_read);
      CREATE INDEX IF NOT EXISTS idx_carrot_chat_messages_room_created ON carrot_chat_messages(room_id, created_at DESC);
    `;

    // Notifications table
    const createNotificationsTableQuery = `
      CREATE TABLE IF NOT EXISTS carrot_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        reference_type VARCHAR(50),
        reference_id INTEGER,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_carrot_notifications_user ON carrot_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_carrot_notifications_is_read ON carrot_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_carrot_notifications_created ON carrot_notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_carrot_notifications_user_unread ON carrot_notifications(user_id, is_read) WHERE is_read = false;
    `;

    // Add constraints
    const addConstraintsQuery = `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_price_positive'
        ) THEN
          ALTER TABLE carrot_products ADD CONSTRAINT chk_price_positive CHECK (price >= 0);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_status_valid'
        ) THEN
          ALTER TABLE carrot_products ADD CONSTRAINT chk_status_valid CHECK (status IN ('active', 'reserved', 'sold', 'deleted'));
        END IF;
      END $$;
    `;

    // Add manner_temp columns to existing tables (migration)
    const addMannerTempQuery = `
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'carrot_user_profiles' AND column_name = 'manner_temp'
        ) THEN
          ALTER TABLE carrot_user_profiles ADD COLUMN manner_temp DECIMAL(4, 1) DEFAULT 36.5;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'carrot_user_profiles' AND column_name = 'total_sales'
        ) THEN
          ALTER TABLE carrot_user_profiles ADD COLUMN total_sales INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'carrot_user_profiles' AND column_name = 'total_purchases'
        ) THEN
          ALTER TABLE carrot_user_profiles ADD COLUMN total_purchases INTEGER DEFAULT 0;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'carrot_products' AND column_name = 'buyer_id'
        ) THEN
          ALTER TABLE carrot_products ADD COLUMN buyer_id INTEGER;
        END IF;
      END $$;
    `;

    // Execute queries
    await pool.query(createUserTableQuery);
    await pool.query(createProductsTableQuery);
    await pool.query(createFavoritesTableQuery);
    await pool.query(createChatRoomsTableQuery);
    await pool.query(createChatMessagesTableQuery);
    await pool.query(createNotificationsTableQuery);
    await pool.query(addConstraintsQuery);
    await pool.query(addMannerTempQuery);

    console.log('✅ Database schema initialized successfully');
    return {
      success: true,
      message: 'Database schema initialized successfully',
      tables: ['carrot_user_profiles', 'carrot_products', 'carrot_favorites', 'carrot_chat_rooms', 'carrot_chat_messages', 'carrot_notifications']
    };
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== USER PROFILE ENDPOINTS ====================

// Create a new user profile
app.post('/api/users', async (req, res) => {
  const {
    firebase_uid,
    email,
    nickname,
    profile_image_url,
    bio,
    latitude,
    longitude,
    address,
    preferences
  } = req.body;

  try {
    const query = `
      INSERT INTO carrot_user_profiles (
        firebase_uid,
        email,
        nickname,
        profile_image_url,
        bio,
        latitude,
        longitude,
        address,
        preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      firebase_uid,
      email,
      nickname,
      profile_image_url || null,
      bio || null,
      latitude || null,
      longitude || null,
      address || null,
      preferences ? JSON.stringify(preferences) : null
    ];

    const result = await pool.query(query, values);
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user profile:', error);

    if (error.code === '23505') { // Unique violation
      res.status(409).json({
        success: false,
        error: 'User with this Firebase UID or email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Get user profile by Firebase UID (공개 정보 - 인증 불필요)
app.get('/api/users/:firebase_uid', optionalAuth, async (req, res) => {
  const { firebase_uid } = req.params;

  try {
    const query = 'SELECT * FROM carrot_user_profiles WHERE firebase_uid = $1';
    const result = await pool.query(query, [firebase_uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    const profile = result.rows[0];

    // 본인이 아닌 경우 민감한 정보 제거
    if (!req.user || req.user.uid !== firebase_uid) {
      delete profile.email;
      delete profile.preferences;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile (본인만 수정 가능)
app.put('/api/users/:firebase_uid', authenticateUser, async (req, res) => {
  const { firebase_uid } = req.params;
  const updates = req.body;

  // 본인 프로필만 수정 가능
  if (req.user.uid !== firebase_uid) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own profile'
    });
  }

  try {
    // Build dynamic UPDATE query
    const setClause = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'email', 'nickname', 'profile_image_url', 'bio',
      'latitude', 'longitude', 'address', 'preferences'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(key === 'preferences' ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Add updated_at
    setClause.push(`updated_at = NOW()`);

    // Add firebase_uid for WHERE clause
    values.push(firebase_uid);

    const query = `
      UPDATE carrot_user_profiles
      SET ${setClause.join(', ')}
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
      error: error.message
    });
  }
});

// Delete user profile (본인만 삭제 가능)
app.delete('/api/users/:firebase_uid', authenticateUser, async (req, res) => {
  const { firebase_uid } = req.params;

  // 본인 프로필만 삭제 가능
  if (req.user.uid !== firebase_uid) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete your own profile'
    });
  }

  try {
    const query = 'DELETE FROM carrot_user_profiles WHERE firebase_uid = $1 RETURNING *';
    const result = await pool.query(query, [firebase_uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    res.json({
      success: true,
      message: 'User profile deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all users (with pagination) - 공개 API이지만 민감 정보 제거
app.get('/api/users', optionalAuth, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const countQuery = 'SELECT COUNT(*) FROM carrot_user_profiles';
    const dataQuery = `
      SELECT
        firebase_uid,
        nickname,
        profile_image_url,
        bio,
        address,
        created_at
      FROM carrot_user_profiles
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery),
      pool.query(dataQuery, [limit, offset])
    ]);

    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search users by nickname (이메일 검색 제거로 개인정보 보호)
app.get('/api/users/search', optionalAuth, async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query (q) is required'
    });
  }

  try {
    const query = `
      SELECT
        firebase_uid,
        nickname,
        profile_image_url,
        bio,
        address,
        created_at
      FROM carrot_user_profiles
      WHERE nickname ILIKE $1
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [`%${q}%`]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload profile image (본인만 업로드 가능)
app.post('/api/users/:firebase_uid/profile-image', authenticateUser, upload.single('profile_image'), async (req, res) => {
  const { firebase_uid } = req.params;
  const file = req.file;

  // 본인 프로필만 수정 가능
  if (req.user.uid !== firebase_uid) {
    if (file) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    return res.status(403).json({
      success: false,
      error: 'You can only update your own profile image'
    });
  }

  if (!file) {
    return res.status(400).json({
      success: false,
      error: 'No image file uploaded'
    });
  }

  try {
    const imageUrl = `/uploads/${file.filename}`;

    // 기존 프로필 이미지 가져오기
    const getUserQuery = 'SELECT profile_image_url FROM carrot_user_profiles WHERE firebase_uid = $1';
    const userResult = await pool.query(getUserQuery, [firebase_uid]);

    if (userResult.rows.length === 0) {
      // 파일 삭제
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    const oldImageUrl = userResult.rows[0].profile_image_url;

    // 프로필 이미지 URL 업데이트
    const updateQuery = `
      UPDATE carrot_user_profiles
      SET profile_image_url = $1, updated_at = NOW()
      WHERE firebase_uid = $2
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [imageUrl, firebase_uid]);

    // 기존 이미지 파일 삭제
    if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
      const oldFilename = oldImageUrl.replace('/uploads/', '');
      const oldFilePath = path.join(__dirname, 'uploads', oldFilename);
      fs.unlink(oldFilePath, (err) => {
        if (err) console.error('Error deleting old profile image:', err);
      });
    }

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);

    // 업로드된 파일 삭제 (에러 발생 시)
    if (file) {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user profile (본인 정보 전체 조회)
app.get('/api/users/me', authenticateUser, async (req, res) => {
  try {
    const query = 'SELECT * FROM carrot_user_profiles WHERE firebase_uid = $1';
    const result = await pool.query(query, [req.user.uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found',
        firebase_uid: req.user.uid
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== PRODUCT ENDPOINTS ====================

// Create a new product
app.post('/api/products', async (req, res) => {
  const { title, category, price, description, location, user_id, image_urls } = req.body;

  // 유효성 검사
  if (!title || !category || !price || !description) {
    return res.status(400).json({
      success: false,
      error: '필수 항목을 모두 입력해주세요.'
    });
  }

  if (!user_id) {
    return res.status(400).json({
      success: false,
      error: '사용자 정보가 필요합니다. 로그인해주세요.'
    });
  }

  if (!image_urls || image_urls.length === 0) {
    return res.status(400).json({
      success: false,
      error: '최소 1장의 이미지를 업로드해주세요.'
    });
  }

  try {
    // 이미지 URL 배열 사용 (Supabase Storage에서 업로드된 URL)
    const imageUrls = image_urls;

    const query = `
      INSERT INTO carrot_products (
        title,
        category,
        price,
        description,
        location,
        images,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      title,
      category,
      parseInt(price),
      description,
      location || '내 동네',
      JSON.stringify(imageUrls),
      parseInt(user_id)
    ];

    const result = await pool.query(query, values);

    // Increase seller's manner temperature by 1 for posting a product
    await pool.query(`
      UPDATE carrot_user_profiles
      SET manner_temp = LEAST(manner_temp + 1, 99.9),
          total_sales = total_sales + 1,
          updated_at = NOW()
      WHERE id = $1
    `, [parseInt(user_id)]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating product:', error);

    // 업로드된 파일 삭제 (에러 발생 시)
    files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all products with advanced filtering
app.get('/api/products', async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    minPrice,
    maxPrice,
    location,
    status = 'active',
    sortBy = 'latest' // latest, price_low, price_high, popular
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereClauses = [];
    const params = [];
    let paramCount = 0;

    // Status filter (기본값: active)
    if (status && status !== 'all') {
      whereClauses.push(`status = $${++paramCount}`);
      params.push(status);
    }

    // Category filter
    if (category && category !== 'all') {
      whereClauses.push(`category = $${++paramCount}`);
      params.push(category);
    }

    // Keyword search (제목 + 설명)
    if (search) {
      whereClauses.push(`(title ILIKE $${++paramCount} OR description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    // Price range filter
    if (minPrice !== undefined && minPrice !== '') {
      whereClauses.push(`price >= $${++paramCount}`);
      params.push(parseInt(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      whereClauses.push(`price <= $${++paramCount}`);
      params.push(parseInt(maxPrice));
    }

    // Location filter
    if (location) {
      whereClauses.push(`location ILIKE $${++paramCount}`);
      params.push(`%${location}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'ORDER BY created_at DESC';
    if (sortBy === 'price_low') {
      orderBy = 'ORDER BY price ASC, created_at DESC';
    } else if (sortBy === 'price_high') {
      orderBy = 'ORDER BY price DESC, created_at DESC';
    } else if (sortBy === 'popular') {
      orderBy = 'ORDER BY like_count DESC, view_count DESC, created_at DESC';
    }

    // Count query
    const countQuery = `SELECT COUNT(*) FROM carrot_products ${whereClause}`;

    // Data query
    const dataQuery = `
      SELECT * FROM carrot_products
      ${whereClause}
      ${orderBy}
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(parseInt(limit), offset);

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params.slice(0, paramCount - 2)),
      pool.query(dataQuery, params)
    ]);

    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: parseInt(limit)
      },
      filters: {
        category,
        search,
        minPrice,
        maxPrice,
        location,
        status,
        sortBy
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ID is a valid integer
  if (!id || id === 'undefined' || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid product ID'
    });
  }

  try {
    // 조회수 증가 & 상품 정보 가져오기
    const updateViewQuery = `
      UPDATE carrot_products
      SET view_count = view_count + 1
      WHERE id = $1
    `;
    await pool.query(updateViewQuery, [id]);

    // Fetch product with seller info
    const query = `
      SELECT
        p.*,
        u.id as seller_id,
        u.nickname as seller_nickname,
        u.profile_image_url as seller_profile_image,
        u.address as seller_address,
        u.manner_temp as seller_manner_temp
      FROM carrot_products p
      LEFT JOIN carrot_user_profiles u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = result.rows[0];

    // Structure seller info in response
    res.json({
      success: true,
      data: {
        ...product,
        seller: product.seller_id ? {
          id: product.seller_id,
          nickname: product.seller_nickname,
          profile_image_url: product.seller_profile_image,
          address: product.seller_address,
          manner_temp: product.seller_manner_temp || 36.5
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update product
app.put('/api/products/:id', upload.array('images', 10), async (req, res) => {
  const { id } = req.params;
  const { title, category, price, description, location, status, existingImages } = req.body;
  const files = req.files || [];

  try {
    // 기존 상품 조회
    const checkQuery = 'SELECT * FROM carrot_products WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const currentProduct = checkResult.rows[0];

    // 이미지 URL 처리
    let imageUrls = [];

    // 기존 이미지 유지
    if (existingImages) {
      const existing = typeof existingImages === 'string'
        ? JSON.parse(existingImages)
        : existingImages;
      imageUrls = Array.isArray(existing) ? existing : [];
    }

    // 새로운 이미지 추가
    if (files.length > 0) {
      const newImages = files.map(file => `/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...newImages];
    }

    // 이미지가 하나도 없으면 에러
    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        error: '최소 1장의 이미지가 필요합니다.'
      });
    }

    // 동적 업데이트 쿼리 생성
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = parseInt(price);
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (status !== undefined) updates.status = status;
    if (imageUrls.length > 0) updates.images = JSON.stringify(imageUrls);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      setClause.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }

    setClause.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE carrot_products
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product:', error);

    // 업로드된 파일 삭제 (에러 발생 시)
    files.forEach(file => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete product (soft delete by setting status to 'deleted')
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { hardDelete = false } = req.query;

  try {
    if (hardDelete === 'true') {
      // 하드 삭제 (실제 DB에서 제거)
      const query = 'DELETE FROM carrot_products WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      // 이미지 파일도 삭제
      const images = result.rows[0].images;
      if (images && Array.isArray(images)) {
        images.forEach(imageUrl => {
          const filename = imageUrl.replace('/uploads/', '');
          const filePath = path.join(__dirname, 'uploads', filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting image file:', err);
          });
        });
      }

      res.json({
        success: true,
        message: 'Product permanently deleted',
        data: result.rows[0]
      });
    } else {
      // 소프트 삭제 (상태만 변경)
      const query = `
        UPDATE carrot_products
        SET status = 'deleted', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product marked as deleted',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get products by user ID
app.get('/api/products/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const countQuery = 'SELECT COUNT(*) FROM carrot_products WHERE user_id = $1 AND status != $2';
    const dataQuery = `
      SELECT * FROM carrot_products
      WHERE user_id = $1 AND status != $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, [userId, 'deleted']),
      pool.query(dataQuery, [userId, 'deleted', limit, offset])
    ]);

    const totalProducts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update product status (reserved, sold, etc.)
app.patch('/api/products/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, buyer_id } = req.body;

  const validStatuses = ['active', 'reserved', 'sold', 'deleted'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    // Get product info first to get seller_id and title
    const productResult = await pool.query('SELECT user_id, title FROM carrot_products WHERE id = $1', [id]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    const seller_id = productResult.rows[0].user_id;
    const productTitle = productResult.rows[0].title;

    // Update product status (and buyer_id if sold)
    const query = status === 'sold' && buyer_id
      ? `UPDATE carrot_products
         SET status = $1, buyer_id = $3, updated_at = NOW()
         WHERE id = $2
         RETURNING *`
      : `UPDATE carrot_products
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`;

    const params = status === 'sold' && buyer_id ? [status, id, buyer_id] : [status, id];
    const result = await pool.query(query, params);

    // If sold, increase both seller and buyer's manner temperature by 2
    if (status === 'sold' && buyer_id) {
      // Increase seller's temperature and total_sales
      await pool.query(`
        UPDATE carrot_user_profiles
        SET manner_temp = LEAST(manner_temp + 2, 99.9),
            total_sales = COALESCE(total_sales, 0) + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [seller_id]);

      // Increase buyer's temperature and total_purchases
      await pool.query(`
        UPDATE carrot_user_profiles
        SET manner_temp = LEAST(manner_temp + 2, 99.9),
            total_purchases = COALESCE(total_purchases, 0) + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [buyer_id]);

      // Create notifications for transaction completion
      await createNotification(
        seller_id,
        'transaction',
        '거래 완료',
        `"${productTitle}" 상품이 판매 완료되었어요! 🎉`,
        'product',
        parseInt(id)
      );

      await createNotification(
        buyer_id,
        'transaction',
        '구매 완료',
        `"${productTitle}" 상품을 구매했어요! 🎉`,
        'product',
        parseInt(id)
      );
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's purchase history (구매내역)
app.get('/api/users/:user_id/purchases', async (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Count total purchases
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM carrot_products WHERE buyer_id = $1',
      [user_id]
    );
    const totalProducts = parseInt(countResult.rows[0].count);

    // Get purchased products
    const query = `
      SELECT p.*, u.nickname as seller_name, u.profile_image_url as seller_profile_image
      FROM carrot_products p
      LEFT JOIN carrot_user_profiles u ON p.user_id = u.id
      WHERE p.buyer_id = $1
      ORDER BY p.updated_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== FAVORITES ENDPOINTS ====================

// Add a product to favorites (찜하기)
app.post('/api/favorites', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id and product_id are required'
    });
  }

  try {
    // Check if product exists and get owner info
    const productCheck = await pool.query(
      'SELECT id, user_id, title FROM carrot_products WHERE id = $1',
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = productCheck.rows[0];

    // Insert favorite
    const query = `
      INSERT INTO carrot_favorites (user_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, product_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, product_id]);

    if (result.rows.length === 0) {
      // Already favorited
      return res.json({
        success: true,
        message: 'Product already in favorites',
        alreadyExists: true
      });
    }

    // Update like_count in products table
    await pool.query(
      'UPDATE carrot_products SET like_count = like_count + 1 WHERE id = $1',
      [product_id]
    );

    // Create notification for product owner (if not self-favorite)
    if (product.user_id !== user_id) {
      await createNotification(
        product.user_id,
        'favorite',
        '관심 등록',
        `누군가 "${product.title}" 상품에 관심을 표시했어요`,
        'product',
        product_id
      );
    }

    res.status(201).json({
      success: true,
      message: 'Product added to favorites',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Remove a product from favorites (찜 취소)
app.delete('/api/favorites', async (req, res) => {
  const { user_id, product_id } = req.body;

  if (!user_id || !product_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id and product_id are required'
    });
  }

  try {
    const query = `
      DELETE FROM carrot_favorites
      WHERE user_id = $1 AND product_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, product_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorite not found'
      });
    }

    // Update like_count in products table
    await pool.query(
      'UPDATE carrot_products SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
      [product_id]
    );

    res.json({
      success: true,
      message: 'Product removed from favorites',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's favorite products
app.get('/api/favorites/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Get favorites with product details
    const query = `
      SELECT
        f.id AS favorite_id,
        f.created_at AS favorited_at,
        p.*
      FROM carrot_favorites f
      JOIN carrot_products p ON f.product_id = p.id
      WHERE f.user_id = $1 AND p.status != 'deleted'
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM carrot_favorites f
      JOIN carrot_products p ON f.product_id = p.id
      WHERE f.user_id = $1 AND p.status != 'deleted'
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [user_id, limit, offset]),
      pool.query(countQuery, [user_id])
    ]);

    const totalFavorites = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalFavorites / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalFavorites,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if a product is favorited by a user
app.get('/api/favorites/check/:user_id/:product_id', async (req, res) => {
  const { user_id, product_id } = req.params;

  try {
    const query = `
      SELECT id FROM carrot_favorites
      WHERE user_id = $1 AND product_id = $2
    `;
    const result = await pool.query(query, [user_id, product_id]);

    res.json({
      success: true,
      isFavorited: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get favorite product IDs for a user (lightweight)
app.get('/api/favorites/:user_id/ids', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT product_id FROM carrot_favorites
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [user_id]);

    res.json({
      success: true,
      favoriteIds: result.rows.map(row => row.product_id)
    });
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== DATABASE MANAGEMENT ENDPOINTS ====================

// Initialize database schema
app.post('/api/db/init', async (req, res) => {
  try {
    const result = await initializeDatabase();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get database schema information
app.get('/api/db/schema', async (req, res) => {
  try {
    const query = `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'carrot_user_profiles'
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      table: 'carrot_user_profiles',
      columns: result.rows
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CHAT ROOM ENDPOINTS ====================

// Create a new chat room between users
app.post('/api/chat/rooms', async (req, res) => {
  const { user1_id, user2_id, product_id } = req.body;

  if (!user1_id || !user2_id) {
    return res.status(400).json({
      success: false,
      error: 'user1_id and user2_id are required'
    });
  }

  try {
    // Check if chat room already exists between these users for this product
    const existingRoomQuery = `
      SELECT * FROM carrot_chat_rooms
      WHERE ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))
      AND ($3::INTEGER IS NULL OR product_id = $3)
      LIMIT 1
    `;
    const existingRoom = await pool.query(existingRoomQuery, [user1_id, user2_id, product_id || null]);

    if (existingRoom.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Chat room already exists',
        data: existingRoom.rows[0]
      });
    }

    // Create new chat room
    const createRoomQuery = `
      INSERT INTO carrot_chat_rooms (user1_id, user2_id, product_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(createRoomQuery, [user1_id, user2_id, product_id || null]);

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all chat rooms for a user
app.get('/api/chat/rooms/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT
        cr.*,
        CASE
          WHEN cr.user1_id = $1 THEN cr.user2_id
          ELSE cr.user1_id
        END AS other_user_id,
        CASE
          WHEN cr.user1_id = $1 THEN u2.nickname
          ELSE u1.nickname
        END AS other_user_nickname,
        CASE
          WHEN cr.user1_id = $1 THEN u2.profile_image_url
          ELSE u1.profile_image_url
        END AS other_user_profile_image,
        (
          SELECT m.content
          FROM carrot_chat_messages m
          WHERE m.room_id = cr.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT m.created_at
          FROM carrot_chat_messages m
          WHERE m.room_id = cr.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS last_message_at,
        (
          SELECT COUNT(*)
          FROM carrot_chat_messages m
          WHERE m.room_id = cr.id
          AND m.sender_id != $1
          AND m.is_read = false
        ) AS unread_count,
        p.title AS product_title,
        p.price AS product_price,
        p.images AS product_images
      FROM carrot_chat_rooms cr
      LEFT JOIN carrot_products p ON cr.product_id = p.id
      LEFT JOIN carrot_user_profiles u1 ON cr.user1_id = u1.id
      LEFT JOIN carrot_user_profiles u2 ON cr.user2_id = u2.id
      WHERE cr.user1_id = $1 OR cr.user2_id = $1
      ORDER BY GREATEST(cr.updated_at, COALESCE((
        SELECT MAX(m.created_at)
        FROM carrot_chat_messages m
        WHERE m.room_id = cr.id
      ), cr.updated_at)) DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) FROM carrot_chat_rooms
      WHERE user1_id = $1 OR user2_id = $1
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, [user_id, limit, offset]),
      pool.query(countQuery, [user_id])
    ]);

    const totalRooms = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRooms / limit);

    res.json({
      success: true,
      data: dataResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRooms,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chat room details by ID
app.get('/api/chat/rooms/:room_id', async (req, res) => {
  const { room_id } = req.params;

  try {
    const query = `
      SELECT
        cr.*,
        p.title AS product_title,
        p.price AS product_price,
        p.images AS product_images,
        p.status AS product_status,
        p.user_id AS product_user_id,
        u1.id AS user1_profile_id,
        u1.nickname AS user1_nickname,
        u1.profile_image_url AS user1_profile_image,
        u2.id AS user2_profile_id,
        u2.nickname AS user2_nickname,
        u2.profile_image_url AS user2_profile_image
      FROM carrot_chat_rooms cr
      LEFT JOIN carrot_products p ON cr.product_id = p.id
      LEFT JOIN carrot_user_profiles u1 ON cr.user1_id = u1.id
      LEFT JOIN carrot_user_profiles u2 ON cr.user2_id = u2.id
      WHERE cr.id = $1
    `;
    const result = await pool.query(query, [room_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const room = result.rows[0];

    // Structure users info in response
    res.json({
      success: true,
      data: {
        ...room,
        user1: {
          id: room.user1_id,
          nickname: room.user1_nickname,
          profile_image_url: room.user1_profile_image
        },
        user2: {
          id: room.user2_id,
          nickname: room.user2_nickname,
          profile_image_url: room.user2_profile_image
        }
      }
    });
  } catch (error) {
    console.error('Error fetching chat room:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CHAT MESSAGE ENDPOINTS ====================

// Send a message (REST API)
app.post('/api/chat/messages', async (req, res) => {
  const { room_id, sender_id, content, message_type = 'text' } = req.body;

  if (!room_id || !sender_id || !content) {
    return res.status(400).json({
      success: false,
      error: 'room_id, sender_id, and content are required'
    });
  }

  try {
    // Verify room exists and get participants
    const roomCheck = await pool.query('SELECT * FROM carrot_chat_rooms WHERE id = $1', [room_id]);
    if (roomCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Chat room not found'
      });
    }

    const room = roomCheck.rows[0];

    // Insert message
    const insertQuery = `
      INSERT INTO carrot_chat_messages (room_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [room_id, sender_id, content, message_type]);

    // Update room's updated_at timestamp
    await pool.query('UPDATE carrot_chat_rooms SET updated_at = NOW() WHERE id = $1', [room_id]);

    const message = result.rows[0];

    // Note: Real-time broadcasting is handled by Supabase Realtime on the client side

    // Create notification for recipient
    const recipientId = room.user1_id === sender_id ? room.user2_id : room.user1_id;

    // Get sender nickname
    const senderQuery = await pool.query('SELECT nickname FROM carrot_user_profiles WHERE id = $1', [sender_id]);
    const senderName = senderQuery.rows[0]?.nickname || '사용자';

    await createNotification(
      recipientId,
      'chat',
      '새 메시지',
      `${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      'chat_room',
      room_id
    );

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get messages for a chat room with pagination
app.get('/api/chat/rooms/:room_id/messages', async (req, res) => {
  const { room_id } = req.params;
  const { page = 1, limit = 50, before_id } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query, params;

    if (before_id) {
      // Load older messages (infinite scroll)
      query = `
        SELECT * FROM carrot_chat_messages
        WHERE room_id = $1 AND id < $2
        ORDER BY created_at DESC
        LIMIT $3
      `;
      params = [room_id, before_id, limit];
    } else {
      // Load latest messages
      query = `
        SELECT * FROM carrot_chat_messages
        WHERE room_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [room_id, limit, offset];
    }

    const countQuery = 'SELECT COUNT(*) FROM carrot_chat_messages WHERE room_id = $1';

    const [dataResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, [room_id])
    ]);

    const totalMessages = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: dataResult.rows.reverse(), // Reverse to show oldest first
      pagination: {
        totalMessages,
        limit: parseInt(limit),
        hasMore: dataResult.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark messages as read
app.patch('/api/chat/messages/read', async (req, res) => {
  const { room_id, user_id } = req.body;

  if (!room_id || !user_id) {
    return res.status(400).json({
      success: false,
      error: 'room_id and user_id are required'
    });
  }

  try {
    const query = `
      UPDATE carrot_chat_messages
      SET is_read = true
      WHERE room_id = $1
      AND sender_id != $2
      AND is_read = false
      RETURNING id
    `;
    const result = await pool.query(query, [room_id, user_id]);

    // Note: Read status updates handled via Supabase Realtime

    res.json({
      success: true,
      message: `${result.rows.length} messages marked as read`,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread message count for a user
app.get('/api/chat/messages/unread/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM carrot_chat_messages m
      JOIN carrot_chat_rooms r ON m.room_id = r.id
      WHERE (r.user1_id = $1 OR r.user2_id = $1)
      AND m.sender_id != $1
      AND m.is_read = false
    `;
    const result = await pool.query(query, [user_id]);

    res.json({
      success: true,
      unread_count: parseInt(result.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a message
app.delete('/api/chat/messages/:message_id', async (req, res) => {
  const { message_id } = req.params;
  const { user_id } = req.body;

  try {
    // Verify message belongs to user
    const checkQuery = 'SELECT * FROM carrot_chat_messages WHERE id = $1 AND sender_id = $2';
    const checkResult = await pool.query(checkQuery, [message_id, user_id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you are not authorized to delete it'
      });
    }

    const room_id = checkResult.rows[0].room_id;

    // Soft delete: mark as deleted
    const deleteQuery = `
      UPDATE carrot_chat_messages
      SET content = '삭제된 메시지입니다', message_type = 'deleted'
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(deleteQuery, [message_id]);

    // Note: Message deletion updates handled via Supabase Realtime

    res.json({
      success: true,
      message: 'Message deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== NOTIFICATIONS API ====================

// Get notifications for a user
app.get('/api/notifications/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const query = `
      SELECT * FROM carrot_notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [user_id, limit, offset]);

    // Get unread count
    const countQuery = `
      SELECT COUNT(*) as unread_count
      FROM carrot_notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const countResult = await pool.query(countQuery, [user_id]);

    res.json({
      success: true,
      data: result.rows,
      unreadCount: parseInt(countResult.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread notification count
app.get('/api/notifications/unread/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT COUNT(*) as unread_count
      FROM carrot_notifications
      WHERE user_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [user_id]);

    res.json({
      success: true,
      unreadCount: parseInt(result.rows[0].unread_count)
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE carrot_notifications
      SET is_read = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark all notifications as read for a user
app.patch('/api/notifications/read-all/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      UPDATE carrot_notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING *
    `;
    const result = await pool.query(query, [user_id]);

    res.json({
      success: true,
      message: `Marked ${result.rowCount} notifications as read`,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM carrot_notifications WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to create notification
async function createNotification(userId, type, title, message, referenceType = null, referenceId = null) {
  try {
    const query = `
      INSERT INTO carrot_notifications (user_id, type, title, message, reference_type, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [userId, type, title, message, referenceType, referenceId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// ==================== WEBSOCKET HANDLERS ====================

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Realtime chat powered by Supabase Realtime`);

  // Auto-initialize database schema on server start
  try {
    await initializeDatabase();
    console.log('🗄️ Database schema auto-initialized');
  } catch (error) {
    console.error('⚠️ Failed to auto-initialize database:', error.message);
    console.log(`🔧 Manual init available: POST http://localhost:${PORT}/api/db/init`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

// Export app for Vercel serverless deployment
module.exports = app;

