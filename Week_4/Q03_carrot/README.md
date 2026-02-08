# Carrot - User Profile Database System

PostgreSQL-based user profile management system with Firebase Authentication integration.

## 📋 Features

- ✅ Firebase UID integration
- ✅ **Firebase Authentication middleware** (본인만 수정/삭제 가능)
- ✅ User profile management (email, nickname, profile image, bio)
- ✅ **Profile image upload** (자동 기존 이미지 삭제)
- ✅ Location storage (GPS coordinates + address)
- ✅ Flexible user preferences (JSONB)
- ✅ RESTful API endpoints
- ✅ **Privacy protection** (공개 API는 민감 정보 제거)
- ✅ Automatic timestamp management
- ✅ Optimized indexes for performance
- ✅ Data validation and constraints
- ✅ Pagination and search support

## 🗄️ Database Schema

```mermaid
erDiagram
    user_profiles {
        SERIAL id PK
        VARCHAR firebase_uid UK "Firebase Authentication UID"
        VARCHAR email UK "User email address"
        VARCHAR nickname "Display name"
        TEXT profile_image_url "Profile image URL"
        TEXT bio "User biography"
        DECIMAL latitude "GPS latitude (-90 to 90)"
        DECIMAL longitude "GPS longitude (-180 to 180)"
        TEXT address "Formatted address"
        JSONB preferences "User settings JSON"
        TIMESTAMPTZ created_at "Creation timestamp"
        TIMESTAMPTZ updated_at "Last update timestamp"
    }
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ database
- Remote PostgreSQL URL (or local instance)
- Firebase project with Authentication enabled
- Firebase Admin SDK service account key

### Installation

1. **Clone and install dependencies**

```bash
cd carrot
npm install
```

2. **Configure environment variables**

```bash
# Copy example env file
cp .env.example .env

# Edit .env and configure:
# 1. PostgreSQL database URL
# 2. Firebase Admin SDK credentials
```

Example `.env` file:

```env
DATABASE_URL=postgres://username:password@host:port/database
PORT=5000
NODE_ENV=development

# Firebase Admin SDK - Option 1: JSON string (recommended for production)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}

# Firebase Admin SDK - Option 2: File path (for local development)
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

3. **Initialize database schema**

Option A: Run migration SQL directly
```bash
psql $DATABASE_URL -f migrations/001_create_user_profiles.sql
```

Option B: Use the API endpoint (after starting server)
```bash
npm start
curl -X POST http://localhost:5000/api/db/init
```

4. **Start the server**

```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

Most endpoints require Firebase Authentication. Include the Firebase ID Token in the `Authorization` header:

```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

For detailed API documentation, see [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Health Check

```bash
GET /health
```

### User Profile Management

#### Create User Profile

```bash
POST /api/users
Content-Type: application/json

{
  "firebase_uid": "firebase_uid_12345",
  "email": "user@example.com",
  "nickname": "JohnDoe",
  "profile_image_url": "https://example.com/profile.jpg",
  "bio": "Software developer",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "address": "Seoul, South Korea",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### Get Current User Profile (본인 전체 정보)

```bash
GET /api/users/me
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### Get User Profile by Firebase UID (공개 정보만)

```bash
GET /api/users/:firebase_uid
```

Example:
```bash
curl http://localhost:5000/api/users/firebase_uid_12345
```

**Note**: 본인이 아닌 경우 `email`, `preferences` 등 민감 정보는 제외됩니다.

#### Update User Profile (본인만 수정 가능)

```bash
PUT /api/users/:firebase_uid
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "nickname": "Jane Doe",
  "bio": "Updated biography",
  "preferences": {
    "theme": "light"
  }
}
```

#### Upload Profile Image (본인만 업로드 가능)

```bash
POST /api/users/:firebase_uid/profile-image
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: multipart/form-data

profile_image: [Image File]
```

- 자동으로 기존 프로필 이미지를 삭제합니다
- 지원 포맷: JPEG, PNG, GIF, WebP
- 최대 파일 크기: 5MB

#### Delete User Profile (본인만 삭제 가능)

```bash
DELETE /api/users/:firebase_uid
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

⚠️ **Warning**: This permanently deletes the user profile.

#### Get All Users (with pagination)

```bash
GET /api/users?page=1&limit=10
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Note**: 민감 정보(email, preferences)는 제외됩니다.

#### Search Users

```bash
GET /api/users/search?q=john
```

Searches in `nickname` field only (case-insensitive). 개인정보 보호를 위해 이메일 검색은 제공하지 않습니다.

### Database Management

#### Initialize Database Schema

```bash
POST /api/db/init
```

Creates the `user_profiles` table with all indexes and constraints.

#### Get Schema Information

```bash
GET /api/db/schema
```

Returns detailed information about the `user_profiles` table structure.

## 📊 Example Usage

### JavaScript/Node.js with Firebase Authentication

```javascript
const axios = require('axios');
const { getAuth } = require('firebase/auth');

const API_BASE = 'http://localhost:5000/api';

// Get Firebase ID Token
async function getIdToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
}

// Create axios instance with auth header
async function createAuthApi() {
  const idToken = await getIdToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });
}

// Get current user profile (본인 전체 정보)
async function getMyProfile() {
  const api = await createAuthApi();
  const response = await api.get('/users/me');
  console.log('My profile:', response.data);
}

// Update user profile (본인만 수정 가능)
async function updateMyProfile(updates) {
  const api = await createAuthApi();
  const auth = getAuth();
  const firebaseUid = auth.currentUser.uid;

  const response = await api.put(`/users/${firebaseUid}`, updates);
  console.log('User updated:', response.data);
}

// Upload profile image (본인만 업로드 가능)
async function uploadProfileImage(imageFile) {
  const api = await createAuthApi();
  const auth = getAuth();
  const firebaseUid = auth.currentUser.uid;

  const formData = new FormData();
  formData.append('profile_image', imageFile);

  const response = await api.post(`/users/${firebaseUid}/profile-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  console.log('Image uploaded:', response.data);
}

// Get other user's profile (공개 정보만)
async function getUserProfile(firebaseUid) {
  const response = await axios.get(`${API_BASE}/users/${firebaseUid}`);
  console.log('User profile:', response.data);
}
```

### cURL Examples

```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "firebase_uid_12345",
    "email": "user@example.com",
    "nickname": "JohnDoe",
    "latitude": 37.5665,
    "longitude": 126.9780,
    "address": "Seoul, South Korea"
  }'

# Get user
curl http://localhost:5000/api/users/firebase_uid_12345

# Update user
curl -X PUT http://localhost:5000/api/users/firebase_uid_12345 \
  -H "Content-Type: application/json" \
  -d '{"nickname": "Jane Doe"}'

# Search users
curl http://localhost:5000/api/users/search?q=john

# Get all users with pagination
curl http://localhost:5000/api/users?page=1&limit=10
```

## 🔧 Database Configuration

### Supported PostgreSQL Providers

- **Heroku Postgres**
- **Railway**
- **Supabase**
- **Neon**
- **Amazon RDS**
- **Google Cloud SQL**
- **Local PostgreSQL**

### Connection String Format

```
postgres://username:password@host:port/database
```

### SSL Configuration

For production environments, SSL is automatically enabled. For local development, it's disabled by default.

## 📁 Project Structure

```
carrot/
├── server.js                        # Main server with all API endpoints
├── .env                             # Environment variables (not in git)
├── .env.example                     # Example environment file
├── package.json                     # Node.js dependencies
├── migrations/
│   └── 001_create_user_profiles.sql # Database schema migration
├── docs/
│   └── database-schema.md           # Detailed schema documentation
└── README.md                        # This file
```

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Contains sensitive database credentials
2. **Use environment variables** - Store all secrets in `.env`
3. **Enable SSL in production** - Ensure encrypted database connections
4. **Validate input data** - API validates all user inputs
5. **Use parameterized queries** - Prevents SQL injection attacks
6. **Implement rate limiting** - Add rate limiting middleware in production
7. **Firebase Authentication** - All sensitive endpoints require Firebase Auth tokens
8. **本人 확인** - 프로필 수정/삭제는 본인만 가능 (Firebase UID 검증)
9. **Privacy protection** - 공개 API는 민감 정보 제거 (email, preferences)
10. **HTTPS only** - 프로덕션 환경에서는 반드시 HTTPS 사용

## 🧪 Testing

### Manual Testing

```bash
# 1. Start server
npm start

# 2. Initialize database
curl -X POST http://localhost:5000/api/db/init

# 3. Create a test user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_uid_001",
    "email": "test@example.com",
    "nickname": "TestUser"
  }'

# 4. Retrieve the user
curl http://localhost:5000/api/users/test_uid_001

# 5. Update the user
curl -X PUT http://localhost:5000/api/users/test_uid_001 \
  -H "Content-Type: application/json" \
  -d '{"nickname": "UpdatedUser"}'

# 6. Search for users
curl http://localhost:5000/api/users/search?q=test

# 7. Delete the user
curl -X DELETE http://localhost:5000/api/users/test_uid_001
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/routing.html)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [API Documentation](docs/API_DOCUMENTATION.md)

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT version();"
```

### Common Errors

1. **"relation does not exist"**
   - Run: `curl -X POST http://localhost:5000/api/db/init`

2. **"duplicate key value violates unique constraint"**
   - Firebase UID or email already exists in database

3. **"SSL connection required"**
   - Update `.env`: Set `NODE_ENV=production`

## 📄 License

MIT License - Feel free to use this project for your own applications.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues and questions:
- Check the [documentation](docs/database-schema.md)
- Review the API endpoints in `server.js`
- Examine the migration file in `migrations/`

---

Built with ❤️ using PostgreSQL, Express, and Node.js
