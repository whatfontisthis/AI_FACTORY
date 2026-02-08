# Implementation Plan: Mac Shopping Website
> **Feature**: Apple Mac E-commerce Practice Website
> **PDCA Phase**: Plan
> **Created**: 2026-02-07
> **Status**: Draft

---

## 1. Executive Summary

### 1.1 Overview
Build a fullstack Apple Mac e-commerce website with Apple-inspired minimal design (black/white, bold, elegant, rounded). Users can browse Mac products, view details, add to cart, checkout with Toss Payments (test mode), and authenticate via Firebase Google Login.

### 1.2 Scope
- **In Scope**: Product catalog, cart, Firebase auth, Toss payment, order management
- **Out of Scope**: Inventory management, reviews, admin dashboard, email notifications

### 1.3 Key Decisions Made
- ✅ **Auth**: Firebase Google Login (hybrid with JWT backend)
- ✅ **Design**: Apple-style (black/white, rounded, minimal)
- ✅ **Stack**: React 18 (CDN), Express 5, PostgreSQL (Supabase), Toss Payments
- ✅ **Deployment**: Vercel serverless

---

## 2. Technical Architecture

### 2.1 System Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (CDN)                       │
│  React 18 + Tailwind CSS + Babel Standalone            │
│  - Product Catalog (Grid/Detail)                       │
│  - Shopping Cart (Context API)                         │
│  - Firebase Auth UI (Google Login)                     │
│  - Toss Payment Widget                                 │
└──────────────────┬──────────────────────────────────────┘
                   │ REST API (JWT Auth)
┌──────────────────▼──────────────────────────────────────┐
│                    BACKEND (Express 5)                  │
│  - Product API                                          │
│  - Cart API (authenticated)                            │
│  - Firebase Token Verification → JWT Issuance          │
│  - Toss Payment Confirmation & Webhook                 │
└──────────────────┬──────────────────────────────────────┘
                   │ SQL Queries
┌──────────────────▼──────────────────────────────────────┐
│              DATABASE (PostgreSQL/Supabase)             │
│  Tables: w4q2_users, w4q2_products,                    │
│          w4q2_cart_items, w4q2_orders,                 │
│          w4q2_order_items                              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack Breakdown

| Layer | Technology | Purpose | CDN/Version |
|-------|-----------|---------|-------------|
| **Frontend** | React 18 | UI components | `unpkg.com/react@18` |
| | Tailwind CSS | Styling | `cdn.tailwindcss.com` |
| | Babel Standalone | JSX transform | `unpkg.com/@babel/standalone` |
| | Firebase Auth SDK | Google login | `firebase CDN v10` |
| **Backend** | Node.js + Express 5 | REST API | `express@5` |
| | jsonwebtoken | API auth | `jsonwebtoken` |
| | bcryptjs | Password hash (optional) | `bcryptjs` |
| | cors | Cross-origin | `cors` |
| **Database** | PostgreSQL | Data storage | Supabase hosted |
| **Payment** | Toss Payments | Checkout | Test API keys |
| **Deployment** | Vercel | Hosting | Serverless functions |

### 2.3 Project Structure
```
w4q2-online-shopping/
├── server.js                      # Express API entry point
├── middleware/
│   ├── auth.js                   # JWT verification middleware
│   └── errorHandler.js           # Global error handler
├── routes/
│   ├── products.js               # GET /api/products, /api/products/:id
│   ├── auth.js                   # POST /api/auth/firebase
│   ├── cart.js                   # Cart CRUD operations
│   ├── checkout.js               # POST /api/checkout/create
│   └── payment.js                # Toss payment confirm/webhook
├── controllers/
│   ├── productController.js
│   ├── authController.js
│   ├── cartController.js
│   └── paymentController.js
├── database/
│   ├── schema.sql                # Table definitions with w4q2_ prefix
│   ├── seed.sql                  # Sample Mac products
│   └── db.js                     # PostgreSQL connection (Supabase)
├── public/
│   ├── index.html                # React SPA (CDN-based)
│   ├── images/                   # Product images
│   │   ├── macbook-air-m2.jpg
│   │   ├── macbook-pro-14.jpg
│   │   └── ...
│   └── favicon.ico
├── .env.example                  # Environment variables template
├── .env                          # Actual secrets (gitignored)
├── package.json
├── vercel.json                   # Deployment config
└── README.md
```

---

## 3. Database Schema

### 3.1 Tables (with `w4q2_` prefix)

```sql
-- Users table
CREATE TABLE w4q2_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Products table
CREATE TABLE w4q2_products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'macbook-air', 'macbook-pro', 'imac', 'mac-mini', 'mac-studio', 'mac-pro'
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  specs JSONB, -- {"chip": "M2", "memory": "8GB", "storage": "256GB", "display": "13.6-inch"}
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart items table
CREATE TABLE w4q2_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES w4q2_users(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES w4q2_products(id),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  config JSONB, -- {"storage": "512GB", "memory": "16GB"}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id, config)
);

-- Orders table
CREATE TABLE w4q2_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES w4q2_users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
  shipping_address JSONB NOT NULL, -- {"name": "...", "address": "...", "city": "...", "zip": "..."}
  payment_id VARCHAR(255) UNIQUE, -- Toss payment ID
  payment_method VARCHAR(50), -- 'toss-card', 'toss-transfer', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Order items table
CREATE TABLE w4q2_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES w4q2_orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50),
  product_name VARCHAR(255), -- Snapshot at purchase time
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cart_user ON w4q2_cart_items(user_id);
CREATE INDEX idx_orders_user ON w4q2_orders(user_id);
CREATE INDEX idx_orders_payment ON w4q2_orders(payment_id);
CREATE INDEX idx_order_items_order ON w4q2_order_items(order_id);
```

### 3.2 Sample Data (Mac Products)

```sql
INSERT INTO w4q2_products (id, name, category, price, image_url, specs, description, in_stock) VALUES
('mac-air-m2-256', 'MacBook Air 13" M2', 'macbook-air', 1299.00, '/images/macbook-air-m2.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "256GB SSD", "display": "13.6-inch Liquid Retina"}',
  'Strikingly thin and fast so you can work, play or create anywhere.', true),

('mac-air-m2-512', 'MacBook Air 13" M2', 'macbook-air', 1499.00, '/images/macbook-air-m2.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "512GB SSD", "display": "13.6-inch Liquid Retina"}',
  'Strikingly thin and fast so you can work, play or create anywhere.', true),

('mac-pro-14-m3', 'MacBook Pro 14" M3', 'macbook-pro', 1999.00, '/images/macbook-pro-14.jpg',
  '{"chip": "Apple M3 Pro", "memory": "18GB", "storage": "512GB SSD", "display": "14.2-inch Liquid Retina XDR"}',
  'Mind-blowing performance. Game-changing battery life.', true),

('mac-pro-16-m3', 'MacBook Pro 16" M3 Max', 'macbook-pro', 3499.00, '/images/macbook-pro-16.jpg',
  '{"chip": "Apple M3 Max", "memory": "36GB", "storage": "1TB SSD", "display": "16.2-inch Liquid Retina XDR"}',
  'The most powerful MacBook Pro ever.', true),

('imac-24-m3', 'iMac 24" M3', 'imac', 1499.00, '/images/imac-24.jpg',
  '{"chip": "Apple M3", "memory": "8GB", "storage": "256GB SSD", "display": "24-inch 4.5K Retina"}',
  'A stunning all-in-one desktop.', true),

('mac-mini-m2', 'Mac mini M2', 'mac-mini', 699.00, '/images/mac-mini.jpg',
  '{"chip": "Apple M2", "memory": "8GB", "storage": "256GB SSD", "display": "N/A (Desktop)"}',
  'Packed with power. Phenomenal value.', true),

('mac-studio-m2', 'Mac Studio M2 Max', 'mac-studio', 2499.00, '/images/mac-studio.jpg',
  '{"chip": "Apple M2 Max", "memory": "32GB", "storage": "512GB SSD", "display": "N/A (Desktop)"}',
  'Supercharged by M2 Max and M2 Ultra.', true);
```

---

## 4. API Design

### 4.1 Endpoint Specifications

#### **Products API**

| Endpoint | Method | Auth | Description | Request | Response |
|----------|--------|------|-------------|---------|----------|
| `/api/products` | GET | No | List all products | Query: `?category=macbook-air` | `{ products: [...] }` |
| `/api/products/:id` | GET | No | Get product detail | Param: `id` | `{ product: {...} }` |

#### **Authentication API**

| Endpoint | Method | Auth | Description | Request Body | Response |
|----------|--------|------|-------------|--------------|----------|
| `/api/auth/firebase` | POST | No | Verify Firebase token, issue JWT | `{ idToken: "..." }` | `{ token: "jwt...", user: {...} }` |

**Flow**:
1. Frontend: User clicks "Sign in with Google"
2. Frontend: Firebase handles Google OAuth → receives `idToken`
3. Frontend: POST `/api/auth/firebase` with `idToken`
4. Backend: Verify Firebase token with Admin SDK
5. Backend: Create/update user in `w4q2_users`
6. Backend: Issue JWT token (expires 7d)
7. Frontend: Store JWT in localStorage
8. Frontend: Include JWT in `Authorization: Bearer <token>` for protected routes

#### **Cart API**

| Endpoint | Method | Auth | Description | Request Body | Response |
|----------|--------|------|-------------|--------------|----------|
| `/api/cart` | GET | Yes | Get user's cart | - | `{ items: [...], subtotal, tax, total }` |
| `/api/cart/add` | POST | Yes | Add item to cart | `{ productId, quantity, config }` | `{ success: true, cart: {...} }` |
| `/api/cart/update/:id` | PATCH | Yes | Update item quantity | `{ quantity }` | `{ success: true }` |
| `/api/cart/remove/:id` | DELETE | Yes | Remove cart item | - | `{ success: true }` |

#### **Checkout & Payment API**

| Endpoint | Method | Auth | Description | Request Body | Response |
|----------|--------|------|-------------|--------------|----------|
| `/api/checkout/create` | POST | Yes | Create order & payment session | `{ shippingAddress }` | `{ orderId, amount, paymentKey }` |
| `/api/payment/toss/confirm` | POST | Yes | Confirm Toss payment | `{ paymentKey, orderId, amount }` | `{ success: true, order }` |
| `/api/payment/webhook` | POST | No | Toss webhook handler | Toss payload | `{ success: true }` |
| `/api/orders/:id` | GET | Yes | Get order details | - | `{ order: {...}, items: [...] }` |

**Payment Flow**:
1. User clicks "Proceed to Payment" → `POST /api/checkout/create`
2. Backend creates order (status: 'pending'), returns `orderId` + `amount`
3. Frontend loads Toss Payment Widget with `orderId`, `amount`, `clientKey`
4. User completes payment in Toss widget
5. Toss redirects to success URL with `paymentKey`, `orderId`, `amount`
6. Frontend → `POST /api/payment/toss/confirm` with params
7. Backend verifies with Toss API, updates order status to 'paid'
8. Backend sends webhook confirmation
9. Frontend shows order confirmation page

### 4.2 Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, firebaseUid }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticateJWT };
```

---

## 5. Frontend Implementation

### 5.1 Component Architecture

```
App (React Context)
├── CartContext (global state)
├── AuthContext (Firebase + JWT)
└── Router
    ├── HomePage
    │   ├── HeroSection
    │   ├── ProductGrid
    │   │   └── ProductCard (x N)
    │   └── CategoryFilter
    ├── ProductDetailPage
    │   ├── ImageGallery
    │   ├── SpecsTable
    │   ├── ConfigSelector (storage, memory)
    │   └── AddToCartButton
    ├── CartSidebar (slide-in)
    │   ├── CartItem (x N)
    │   └── CheckoutButton
    ├── CheckoutPage
    │   ├── OrderSummary
    │   ├── ShippingForm
    │   └── TossPaymentWidget
    ├── OrderConfirmationPage
    │   └── OrderDetails
    └── LoginModal (Firebase UI)
```

### 5.2 Key Components

#### **CartContext.jsx**
```javascript
const CartContext = React.createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], subtotal: 0, tax: 0, total: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = async (product, quantity, config) => {
    // POST /api/cart/add if authenticated
    // Otherwise update local state only
  };

  const updateQuantity = async (itemId, quantity) => {
    // PATCH /api/cart/update/:id
  };

  const removeItem = async (itemId) => {
    // DELETE /api/cart/remove/:id
  };

  const syncCart = async () => {
    // GET /api/cart when user logs in
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem, isCartOpen, setIsCartOpen, syncCart }}>
      {children}
    </CartContext.Provider>
  );
}
```

#### **AuthContext.jsx**
```javascript
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken'));

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await firebase.auth().signInWithPopup(provider);
    const idToken = await result.user.getIdToken();

    // Send to backend
    const response = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const { token, user } = await response.json();
    setJwtToken(token);
    setUser(user);
    localStorage.setItem('jwtToken', token);

    // Sync cart after login
    await syncCart();
  };

  const signOut = () => {
    firebase.auth().signOut();
    setUser(null);
    setJwtToken(null);
    localStorage.removeItem('jwtToken');
  };

  return (
    <AuthContext.Provider value={{ user, jwtToken, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 5.3 Apple-Style Design System (Tailwind)

**Global Styles**
```css
/* Add to <style> in index.html */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.hero-text {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
}

.product-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
}
```

**Component Classes**
- **Buttons**: `bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg`
- **Cards**: `bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden`
- **Inputs**: `border border-gray-300 rounded-lg px-4 py-3 focus:border-black focus:ring-2 focus:ring-black transition-all`
- **Navigation**: `bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-opacity-90`

---

## 6. Implementation Tasks Breakdown

### 6.1 Phase 1: Foundation & Setup (Est. 8 hours)

#### Task 1.1: Project Initialization
- [ ] Create project directory structure
- [ ] Initialize `package.json` with dependencies
- [ ] Set up `.env.example` and `.env`
- [ ] Create `.gitignore` (exclude `.env`, `node_modules`)
- [ ] Set up Vercel project link

**Dependencies**:
```json
{
  "dependencies": {
    "express": "^5.0.0",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.0",
    "dotenv": "^16.4.5",
    "firebase-admin": "^12.0.0"
  }
}
```

**Environment Variables** (`.env.example`):
```env
# Supabase PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secret
JWT_SECRET=your-super-secret-key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Toss Payments (Test Mode)
TOSS_SECRET_KEY=test_sk_...
TOSS_CLIENT_KEY=test_ck_...

# App Config
PORT=3000
NODE_ENV=development
```

#### Task 1.2: Database Setup
- [ ] Connect to Supabase PostgreSQL
- [ ] Run `database/schema.sql` to create tables
- [ ] Run `database/seed.sql` to insert sample products
- [ ] Test connection with simple query
- [ ] Create `database/db.js` connection module

**File**: `database/db.js`
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
```

#### Task 1.3: Express Server Setup
- [ ] Create `server.js` with basic Express app
- [ ] Configure CORS
- [ ] Set up JSON body parser
- [ ] Create health check endpoint `GET /api/health`
- [ ] Test server locally

**File**: `server.js` (minimal version)
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

#### Task 1.4: Frontend HTML Skeleton
- [ ] Create `public/index.html` with CDN links
- [ ] Add React, ReactDOM, Babel Standalone CDNs
- [ ] Add Tailwind CSS CDN
- [ ] Add Firebase Auth SDK CDN
- [ ] Create basic App component
- [ ] Test React rendering

**File**: `public/index.html` (starter template)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mac Store - Apple Shopping</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- React + ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Firebase -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
</head>
<body class="bg-gray-50">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, createContext, useContext } = React;

    // Firebase config
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID"
    };
    firebase.initializeApp(firebaseConfig);

    function App() {
      return (
        <div className="min-h-screen">
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="text-2xl font-bold">Mac Store</div>
              <div className="flex gap-8 items-center">
                <a href="#" className="font-semibold hover:text-gray-600">Products</a>
                <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold">
                  Sign In
                </button>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-6 py-12">
            <h1 className="text-6xl font-bold text-center mb-4">
              Mac Store
            </h1>
            <p className="text-xl text-center text-gray-600">
              Explore the world of Mac
            </p>
          </main>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>
```

---

### 6.2 Phase 2: Product Catalog (Est. 10 hours)

#### Task 2.1: Product API Implementation
- [ ] Create `routes/products.js`
- [ ] Create `controllers/productController.js`
- [ ] Implement `GET /api/products` with category filter
- [ ] Implement `GET /api/products/:id`
- [ ] Test with Postman/curl

**File**: `routes/products.js`
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
```

**File**: `controllers/productController.js`
```javascript
const pool = require('../database/db');

exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let query = 'SELECT * FROM w4q2_products WHERE in_stock = true';
    const params = [];

    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ products: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM w4q2_products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

#### Task 2.2: ProductGrid Component
- [ ] Create ProductGrid component with fetch
- [ ] Create ProductCard component with Apple design
- [ ] Add category filter buttons
- [ ] Add loading state
- [ ] Add hover animations

#### Task 2.3: ProductDetail Page
- [ ] Create ProductDetail component
- [ ] Fetch product by ID from URL param
- [ ] Display large image, specs table
- [ ] Add ConfigSelector (storage/memory variants)
- [ ] Style with Apple aesthetic

---

### 6.3 Phase 3: Shopping Cart (Est. 12 hours)

#### Task 3.1: Cart Context Implementation
- [ ] Create CartContext with state management
- [ ] Implement `addToCart`, `updateQuantity`, `removeItem` functions
- [ ] Calculate subtotal, tax (10%), total
- [ ] Add local storage persistence for guest users

#### Task 3.2: Cart API Implementation
- [ ] Create `routes/cart.js` with auth middleware
- [ ] Create `controllers/cartController.js`
- [ ] Implement `GET /api/cart`
- [ ] Implement `POST /api/cart/add`
- [ ] Implement `PATCH /api/cart/update/:id`
- [ ] Implement `DELETE /api/cart/remove/:id`

#### Task 3.3: Cart UI Components
- [ ] Create CartSidebar slide-in panel
- [ ] Create CartItem component with quantity controls
- [ ] Add "Proceed to Checkout" button
- [ ] Add empty cart state
- [ ] Add cart icon with badge (item count)

---

### 6.4 Phase 4: Authentication (Est. 10 hours)

#### Task 4.1: Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Google authentication
- [ ] Add Firebase config to frontend
- [ ] Download Admin SDK credentials
- [ ] Add credentials to `.env`

#### Task 4.2: Auth Backend
- [ ] Initialize Firebase Admin SDK in `server.js`
- [ ] Create `routes/auth.js`
- [ ] Create `controllers/authController.js`
- [ ] Implement `POST /api/auth/firebase` (verify token, issue JWT)
- [ ] Create `middleware/auth.js` for JWT verification

**File**: `controllers/authController.js`
```javascript
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');

exports.verifyFirebaseToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Create or update user in database
    const result = await pool.query(
      `INSERT INTO w4q2_users (firebase_uid, email, name, photo_url, last_login)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (firebase_uid)
       DO UPDATE SET last_login = NOW()
       RETURNING id, email, name, photo_url`,
      [uid, email, name || '', picture || '']
    );

    const user = result.rows[0];

    // Issue JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, firebaseUid: uid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken, user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Task 4.3: Auth Frontend
- [ ] Create AuthContext
- [ ] Implement `signInWithGoogle` function
- [ ] Implement `signOut` function
- [ ] Create LoginModal component
- [ ] Store JWT in localStorage
- [ ] Add auth state listener
- [ ] Sync cart after login

---

### 6.5 Phase 5: Checkout & Payment (Est. 14 hours)

#### Task 5.1: Checkout Page
- [ ] Create CheckoutPage component
- [ ] Require authentication (redirect if not logged in)
- [ ] Display order summary from cart
- [ ] Create ShippingForm (name, address, city, zip, phone)
- [ ] Validate form inputs
- [ ] Style with Apple design

#### Task 5.2: Toss Payments Integration
- [ ] Register for Toss test account
- [ ] Get test `clientKey` and `secretKey`
- [ ] Add Toss Payment Widget SDK to `index.html`
- [ ] Create `POST /api/checkout/create` endpoint
- [ ] Create order in database (status: 'pending')
- [ ] Load Toss widget with orderId, amount
- [ ] Handle payment success callback

**Toss Widget Example**:
```javascript
const loadTossPayment = (orderId, amount) => {
  const tossPayments = TossPayments(clientKey);

  tossPayments.requestPayment('카드', {
    amount: amount,
    orderId: orderId,
    orderName: '맥북 외 N건',
    successUrl: `${window.location.origin}/payment/success`,
    failUrl: `${window.location.origin}/payment/fail`,
  });
};
```

#### Task 5.3: Payment Confirmation
- [ ] Create `POST /api/payment/toss/confirm` endpoint
- [ ] Verify payment with Toss API
- [ ] Update order status to 'paid'
- [ ] Clear user's cart
- [ ] Return order details
- [ ] Create `POST /api/payment/webhook` for Toss notifications

**File**: `controllers/paymentController.js`
```javascript
const axios = require('axios');
const pool = require('../database/db');

exports.confirmPayment = async (req, res) => {
  try {
    const { paymentKey, orderId, amount } = req.body;

    // Verify with Toss API
    const response = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update order in database
    await pool.query(
      `UPDATE w4q2_orders
       SET status = 'paid', payment_id = $1, payment_method = $2, paid_at = NOW()
       WHERE id = $3`,
      [paymentKey, response.data.method, orderId]
    );

    // Clear cart
    await pool.query('DELETE FROM w4q2_cart_items WHERE user_id = $1', [req.user.userId]);

    res.json({ success: true, order: response.data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

#### Task 5.4: Order Confirmation Page
- [ ] Create OrderConfirmationPage component
- [ ] Fetch order details from `GET /api/orders/:id`
- [ ] Display order number, items, total, shipping address
- [ ] Add "Continue Shopping" button
- [ ] Style with success message and checkmark

---

### 6.6 Phase 6: Polish & Deployment (Est. 10 hours)

#### Task 6.1: Responsive Design
- [ ] Test on mobile (320px, 375px, 768px)
- [ ] Adjust navigation for mobile (hamburger menu)
- [ ] Make product grid responsive (1/2/3/4 columns)
- [ ] Test cart sidebar on mobile
- [ ] Test checkout form on mobile

#### Task 6.2: Loading & Error States
- [ ] Add loading spinner component
- [ ] Add skeleton loaders for products
- [ ] Add error boundary component
- [ ] Add toast notifications for cart actions
- [ ] Add form validation errors

#### Task 6.3: Performance Optimization
- [ ] Add lazy loading for images
- [ ] Add debounce for search/filter
- [ ] Optimize bundle (CDN already optimized)
- [ ] Test page load speed (<2s)

#### Task 6.4: Vercel Deployment
- [ ] Create `vercel.json` config
- [ ] Link project to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy to production
- [ ] Test payment flow in production
- [ ] Set up custom domain (optional)

**File**: `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "public/$1"
    }
  ]
}
```

---

## 7. Testing Strategy

### 7.1 Manual Testing Checklist

#### **Product Catalog**
- [ ] Products load on homepage
- [ ] Category filter works correctly
- [ ] Product images display properly
- [ ] Click product → detail page loads
- [ ] Specs display correctly

#### **Shopping Cart**
- [ ] Add to cart (guest user) → local storage
- [ ] Update quantity → total recalculates
- [ ] Remove item → cart updates
- [ ] Cart badge shows correct count
- [ ] Cart persists on page refresh (guest)

#### **Authentication**
- [ ] Click "Sign In" → Firebase popup
- [ ] Google login → user authenticated
- [ ] JWT stored in localStorage
- [ ] Guest cart merges with user cart
- [ ] Sign out → cart cleared

#### **Checkout & Payment**
- [ ] Checkout requires login (redirect if guest)
- [ ] Shipping form validation works
- [ ] Toss widget loads correctly
- [ ] Test payment with Toss test card
- [ ] Payment success → order created
- [ ] Cart cleared after payment
- [ ] Order confirmation displays

#### **Edge Cases**
- [ ] Empty cart → checkout disabled
- [ ] Invalid product ID → 404 error
- [ ] Expired JWT → 401 error, prompt re-login
- [ ] Payment failure → order stays 'pending'
- [ ] Network error → error message shown

### 7.2 Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + mobile)
- [ ] Firefox (desktop)

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment
- [ ] All environment variables set in Vercel
- [ ] Firebase project configured (production)
- [ ] Toss Payments test keys verified
- [ ] Supabase database accessible from Vercel
- [ ] `.gitignore` includes `.env`

### 8.2 Deployment Steps
1. [ ] Push code to GitHub repository
2. [ ] Connect repository to Vercel
3. [ ] Configure build settings (no build command needed for CDN)
4. [ ] Add environment variables in Vercel dashboard
5. [ ] Deploy to production
6. [ ] Test deployment URL
7. [ ] Configure custom domain (optional)

### 8.3 Post-Deployment
- [ ] Test full user flow in production
- [ ] Verify payment flow with Toss test card
- [ ] Check database connections
- [ ] Monitor Vercel function logs
- [ ] Set up error monitoring (optional: Sentry)

---

## 9. Success Criteria

### 9.1 Functional Requirements
- ✅ Users can browse Mac products by category
- ✅ Users can view product details and specifications
- ✅ Users can add products to cart
- ✅ Users can authenticate with Google (Firebase)
- ✅ Users can checkout with Toss Payments (test mode)
- ✅ Orders are created and stored in database
- ✅ Users receive order confirmation

### 9.2 Non-Functional Requirements
- ✅ Page load time < 2 seconds
- ✅ Mobile responsive (320px - 1920px)
- ✅ Apple-inspired design (black/white, rounded, minimal)
- ✅ Cross-browser compatibility (Chrome, Safari, Firefox)
- ✅ Zero payment errors in test mode
- ✅ Code is clean and maintainable

### 9.3 Learning Outcomes
- ✅ Understand fullstack flow (React → Express → PostgreSQL)
- ✅ Implement Firebase authentication
- ✅ Integrate payment gateway (Toss)
- ✅ Deploy to Vercel serverless
- ✅ Practice Apple-style UI design

---

## 10. Timeline & Effort Estimation

| Phase | Tasks | Estimated Hours | Cumulative |
|-------|-------|-----------------|------------|
| Phase 1: Foundation | 4 tasks | 8 hours | 8h |
| Phase 2: Product Catalog | 3 tasks | 10 hours | 18h |
| Phase 3: Shopping Cart | 3 tasks | 12 hours | 30h |
| Phase 4: Authentication | 3 tasks | 10 hours | 40h |
| Phase 5: Checkout & Payment | 4 tasks | 14 hours | 54h |
| Phase 6: Polish & Deploy | 4 tasks | 10 hours | **64h** |

**Total Estimated Time**: 64 hours (~8 working days at 8 hours/day)

---

## 11. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| CDN downtime | High | Low | Use multiple CDN fallbacks (unpkg → cdnjs) |
| Firebase quota exceeded | Medium | Low | Use test account, monitor usage |
| Toss test API changes | Medium | Low | Follow official documentation, test regularly |
| Supabase connection timeout | High | Medium | Implement connection pooling, retry logic |
| JWT security issues | High | Low | Use strong secret, short expiry, HTTPS only |
| Vercel cold start delay | Low | High | Acceptable for practice project (1-2s) |

---

## 12. Next Steps

### 12.1 Immediate Actions
1. ✅ Review and approve this plan
2. 📋 Create detailed design document (`/pdca design`)
3. 🚀 Start Phase 1: Foundation & Setup
4. 🔄 Track progress with task updates

### 12.2 PDCA Flow
```
✅ Plan (You are here)
  → Design (Next: /pdca design mac-shopping-website)
    → Do (Implementation with task tracking)
      → Check (Gap analysis: /pdca analyze)
        → Act (Iteration if needed: /pdca iterate)
          → Report (/pdca report)
```

---

## 13. Appendix

### 13.1 Useful Resources
- [React CDN Setup](https://react.dev/learn/add-react-to-an-existing-project)
- [Firebase Auth Quickstart](https://firebase.google.com/docs/auth/web/start)
- [Toss Payments Test Guide](https://docs.tosspayments.com/guides/v2/payment-widget/integration)
- [Express 5 Migration](https://expressjs.com/en/guide/migrating-5.html)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)

### 13.2 Toss Test Cards
```
Card Number: 4330-1234-1234-1234
Expiry: Any future date
CVC: Any 3 digits
```

### 13.3 Firebase Test Configuration
```javascript
// Firebase config (replace with your project)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

**Plan Version**: 1.0
**Created By**: Claude (bkit PDCA)
**Status**: Ready for Review
**Next Phase**: Design Document Creation
