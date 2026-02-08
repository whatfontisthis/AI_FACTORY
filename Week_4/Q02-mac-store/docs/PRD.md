# Product Requirements Document (PRD)
## Apple Mac Shopping Practice Website

---

## 1. Project Overview

### 1.1 Purpose
A practice e-commerce website for showcasing and purchasing Apple Mac products, featuring a minimal Apple-inspired design with full shopping cart and payment functionality.

### 1.2 Target Audience
- Primary: Developers learning fullstack e-commerce development
- Secondary: Mac enthusiasts browsing products (practice environment)

### 1.3 Design Philosophy
**Apple-Inspired Aesthetic**
- **Color Scheme**: Black and white with subtle grays
- **Typography**: Bold, clean, sans-serif fonts (SF Pro Display/Inter)
- **Layout**: Minimal, spacious, elegant
- **Components**: Rounded corners, soft shadows, smooth transitions
- **Spacing**: Generous whitespace, breathing room
- **Interactions**: Smooth animations, hover effects, micro-interactions

---

## 2. Core Features

### 2.1 Product Catalog
**User Stories**
- As a user, I want to browse Mac products so I can explore available options
- As a user, I want to filter products by category (MacBook Air, Pro, iMac, Mac Mini, etc.)
- As a user, I want to see product images, prices, and key specs at a glance

**Technical Specifications**
- **Endpoint**: `GET /api/products`
- **Response**: Array of product objects
  ```json
  {
    "id": "mac-001",
    "name": "MacBook Air M2",
    "category": "macbook-air",
    "price": 1299,
    "image": "/images/macbook-air-m2.jpg",
    "specs": {
      "chip": "Apple M2",
      "memory": "8GB",
      "storage": "256GB SSD",
      "display": "13.6-inch Liquid Retina"
    },
    "description": "Strikingly thin and fast...",
    "inStock": true
  }
  ```

### 2.2 Product Details
**User Stories**
- As a user, I want to click a product to see full details
- As a user, I want to view high-quality images and complete specifications
- As a user, I want to select configuration options (storage, memory)

**Technical Specifications**
- **Endpoint**: `GET /api/products/:id`
- **UI Components**:
  - `ProductDetail` - Main detail view
  - `ImageGallery` - Product images with zoom
  - `SpecsTable` - Technical specifications
  - `ConfigSelector` - Storage/memory options
  - `AddToCartButton` - CTA with smooth animation

### 2.3 Shopping Cart
**User Stories**
- As a user, I want to add products to my cart
- As a user, I want to adjust quantities or remove items
- As a user, I want to see the total price updated in real-time

**Technical Specifications**
- **State Management**: React Context/useState
- **Endpoints**:
  - `POST /api/cart/add` - Add item
  - `PATCH /api/cart/update/:itemId` - Update quantity
  - `DELETE /api/cart/remove/:itemId` - Remove item
  - `GET /api/cart` - Get current cart (authenticated users)
- **Data Structure**:
  ```json
  {
    "items": [
      {
        "productId": "mac-001",
        "name": "MacBook Air M2",
        "quantity": 1,
        "price": 1299,
        "config": { "storage": "256GB", "memory": "8GB" }
      }
    ],
    "subtotal": 1299,
    "tax": 129.9,
    "total": 1428.9
  }
  ```

### 2.4 Authentication
**User Stories**
- As a user, I want to log in to save my cart and checkout
- As a user, I want to use social login for quick access

**Technical Specifications - Option A: JWT (Current Tech Stack)**
- **Endpoints**:
  - `POST /api/auth/register` - Email/password registration
  - `POST /api/auth/login` - Email/password login
  - `POST /api/auth/logout` - Clear session
- **Security**: bcryptjs password hashing, JWT tokens
- **Storage**: PostgreSQL users table

**Technical Specifications - Option B: Firebase Social Login (Your Preference)**
- **Provider**: Firebase Authentication
- **Methods**: Google, Apple, Facebook
- **Flow**: Frontend handles Firebase auth → Backend validates Firebase token → Issues JWT
- **Hybrid Approach**: Firebase for auth UI, JWT for API authorization
- **Implementation**:
  ```javascript
  // Frontend: Firebase social login
  // Backend: POST /api/auth/firebase - Verify Firebase token, issue JWT
  ```

**✅ DECISION MADE**: Firebase Social Login (Google)
- **Frontend**: Firebase Authentication SDK (CDN)
- **Backend**: Verify Firebase ID token → Issue JWT for API authorization
- **Hybrid Approach**: Firebase handles auth UI, JWT secures API endpoints
- **Provider**: Google OAuth 2.0

### 2.5 Checkout & Payment
**User Stories**
- As a user, I want to enter shipping information
- As a user, I want to pay securely using Toss Payments
- As a user, I want to receive order confirmation

**Technical Specifications**
- **Payment Gateway**: Toss Payments (Test Mode)
- **Flow**:
  1. User reviews cart
  2. Enters shipping address
  3. Clicks "Proceed to Payment"
  4. Toss Payment widget loads
  5. User completes payment
  6. Webhook confirms payment
  7. Order created in database

- **Endpoints**:
  - `POST /api/checkout/create` - Create checkout session
  - `POST /api/payment/toss/confirm` - Confirm payment
  - `POST /api/payment/webhook` - Toss webhook handler
  - `GET /api/orders/:id` - Get order details

- **Database Tables**:
  ```sql
  -- Note: Add prefix (e.g., 'w4q2_') to all tables
  CREATE TABLE w4q2_orders (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES w4q2_users(id),
    total_amount DECIMAL(10,2),
    status VARCHAR(50), -- 'pending', 'paid', 'shipped', 'delivered'
    shipping_address JSONB,
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE w4q2_order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES w4q2_orders(id),
    product_id VARCHAR(50),
    quantity INTEGER,
    price DECIMAL(10,2),
    config JSONB
  );
  ```

---

## 3. User Flows

### 3.1 Browse & Purchase Flow
```
Landing Page
  → Browse Products (Grid View)
    → Click Product
      → Product Detail Page
        → Select Configuration
          → Add to Cart
            → Cart Sidebar Opens
              → Continue Shopping OR Proceed to Checkout
                → Checkout Page
                  → Login (if not authenticated)
                    → Enter Shipping Info
                      → Toss Payment
                        → Order Confirmation
```

### 3.2 Authentication Flow
```
Guest User
  → Clicks "Sign In"
    → Login Modal
      → Option A: Email/Password
      → Option B: Social Login (Google/Apple)
        → Authenticated
          → Cart Restored
            → Continue Shopping
```

---

## 4. Technical Architecture

### 4.1 Tech Stack (From tech-stack.txt)
**Frontend**
- React 18 (CDN - no build process)
- Tailwind CSS (CDN for styling)
- Babel Standalone (in-browser JSX transformation)

**Backend**
- Node.js + Express 5
- PostgreSQL via Supabase (shared instance)
- JWT authentication
- bcryptjs password hashing

**Additional Services**
- Toss Payments (Test mode)
- CORS enabled

**Deployment**
- Vercel (Serverless)

### 4.2 Project Structure
```
w4q2-online-shopping/
├── server.js                 # Express API server
├── public/
│   ├── index.html           # React SPA (CDN-based)
│   └── images/              # Product images
├── database/
│   └── schema.sql           # PostgreSQL schema
├── package.json
├── vercel.json              # Deployment config
├── .env.example
└── README.md
```

### 4.3 Database Schema

#### Tables (with 'w4q2_' prefix)
```sql
-- Users
CREATE TABLE w4q2_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- null if using social login only
  name VARCHAR(255),
  firebase_uid VARCHAR(255) UNIQUE, -- if using Firebase
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE w4q2_products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  specs JSONB,
  description TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders (see section 2.5 for full schema)

-- Cart (optional - can use session/local storage)
CREATE TABLE w4q2_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES w4q2_users(id),
  product_id VARCHAR(50) REFERENCES w4q2_products(id),
  quantity INTEGER DEFAULT 1,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List all products | No |
| GET | `/api/products/:id` | Get product details | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/firebase` | Verify Firebase token | No |
| GET | `/api/cart` | Get user cart | Yes |
| POST | `/api/cart/add` | Add item to cart | Yes |
| PATCH | `/api/cart/update/:id` | Update cart item | Yes |
| DELETE | `/api/cart/remove/:id` | Remove cart item | Yes |
| POST | `/api/checkout/create` | Create checkout session | Yes |
| POST | `/api/payment/toss/confirm` | Confirm Toss payment | Yes |
| POST | `/api/payment/webhook` | Toss webhook handler | No |
| GET | `/api/orders/:id` | Get order details | Yes |

---

## 5. UI/UX Design Specifications

### 5.1 Design System

**Colors**
```css
/* Primary Palette */
--color-black: #000000;
--color-white: #FFFFFF;
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-800: #1F2937;
--color-gray-900: #111827;

/* Accent (minimal use) */
--color-accent: #000000; /* Pure black for CTAs */
```

**Typography**
```css
/* Headings - Bold, impactful */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-size-hero: 3.5rem; /* 56px */
--font-size-h1: 2.5rem;   /* 40px */
--font-size-h2: 2rem;     /* 32px */
--font-size-h3: 1.5rem;   /* 24px */
--font-weight-bold: 700;
--font-weight-semibold: 600;

/* Body - Clean, readable */
--font-size-body: 1rem;   /* 16px */
--font-size-small: 0.875rem; /* 14px */
--line-height: 1.6;
```

**Spacing**
```css
/* Generous whitespace */
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 2rem;     /* 32px */
--spacing-lg: 4rem;     /* 64px */
--spacing-xl: 6rem;     /* 96px */
```

**Border Radius**
```css
/* Rounded, friendly */
--radius-sm: 0.5rem;   /* 8px - buttons, inputs */
--radius-md: 1rem;     /* 16px - cards */
--radius-lg: 1.5rem;   /* 24px - modals */
--radius-full: 9999px; /* Pills, badges */
```

**Shadows**
```css
/* Subtle, elegant */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
```

### 5.2 Component Specifications

**Button Styles**
```jsx
// Primary CTA - Black background
<button className="bg-black text-white px-8 py-3 rounded-lg font-semibold
                   hover:bg-gray-800 transition-all duration-300
                   shadow-md hover:shadow-lg">
  Add to Cart
</button>

// Secondary - White with black border
<button className="bg-white text-black px-8 py-3 rounded-lg font-semibold
                   border-2 border-black hover:bg-gray-50
                   transition-all duration-300">
  Learn More
</button>
```

**Product Card**
```jsx
<div className="bg-white rounded-2xl shadow-sm hover:shadow-xl
                transition-shadow duration-300 overflow-hidden">
  <img className="w-full h-64 object-cover" />
  <div className="p-6">
    <h3 className="text-2xl font-bold mb-2">MacBook Air M2</h3>
    <p className="text-gray-600 mb-4">Strikingly thin and fast</p>
    <p className="text-3xl font-bold mb-4">$1,299</p>
    <button>Add to Cart</button>
  </div>
</div>
```

**Navigation**
```jsx
<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <div className="text-2xl font-bold">Mac Store</div>
    <div className="flex gap-8 items-center">
      <a className="font-semibold hover:text-gray-600">Products</a>
      <button className="relative">
        <ShoppingCartIcon />
        <span className="badge">3</span>
      </button>
      <button>Sign In</button>
    </div>
  </div>
</nav>
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure (CDN-based React)
- [ ] Configure Supabase PostgreSQL with `w4q2_` prefix
- [ ] Design database schema
- [ ] Set up Express server with CORS
- [ ] Create basic routing

### Phase 2: Product Catalog (Week 1-2)
- [ ] Seed product data (Mac lineup)
- [ ] Build product grid component
- [ ] Implement product detail page
- [ ] Add filtering by category

### Phase 3: Shopping Cart (Week 2)
- [ ] Cart context/state management
- [ ] Add to cart functionality
- [ ] Cart sidebar with animations
- [ ] Quantity adjustment
- [ ] Cart persistence (local storage + API)

### Phase 4: Authentication (Week 3)
- [ ] Decide: JWT-only vs Firebase hybrid
- [ ] Implement chosen auth system
- [ ] Login/register UI (modal)
- [ ] Protected routes
- [ ] Session management

### Phase 5: Checkout & Payment (Week 3-4)
- [ ] Checkout form (shipping address)
- [ ] Toss Payments integration (test mode)
- [ ] Payment confirmation flow
- [ ] Order creation in database
- [ ] Order confirmation page

### Phase 6: Polish & Deploy (Week 4)
- [ ] Responsive design refinement
- [ ] Loading states & animations
- [ ] Error handling
- [ ] Deploy to Vercel
- [ ] Test payment flow end-to-end

---

## 7. Success Metrics

### Technical Metrics
- Page load time < 2 seconds
- Mobile responsive (320px - 1920px)
- Cross-browser compatibility (Chrome, Safari, Firefox)
- Zero payment errors in test mode

### Learning Metrics
- Complete understanding of fullstack flow (React → Express → PostgreSQL)
- Successful payment integration with Toss
- Clean, maintainable code structure
- Git commits with clear messages

---

## 8. Out of Scope (V1)

❌ Not included in this practice project:
- Inventory management
- Product reviews/ratings
- Wishlist functionality
- Order tracking after purchase
- Admin dashboard
- Email notifications
- Multiple payment methods
- Internationalization (i18n)

---

## 9. Risk & Considerations

| Risk | Mitigation |
|------|------------|
| CDN reliability | Use fallback CDN sources (unpkg → cdnjs) |
| Payment testing | Use Toss test API keys, never real payments |
| Database conflicts | Prefix all tables with `w4q2_` |
| Security | Use JWT, validate all inputs, HTTPS only |
| Vercel cold starts | Expect 1-2s cold start delay (acceptable for practice) |

---

## 10. Resources & Documentation

**Design Inspiration**
- Apple.com product pages
- Minimalist e-commerce examples

**Technical Docs**
- [Toss Payments Test Guide](https://docs.tosspayments.com/reference/widget-sdk)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- [React CDN Setup](https://react.dev/learn/add-react-to-an-existing-project)
- [Express 5 Guide](https://expressjs.com/en/guide/routing.html)

**Deployment**
- [Vercel Node.js Deployment](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

---

## 11. Next Steps

### Immediate Actions
1. ✅ **DECISION**: Choose authentication approach (JWT / Firebase / Hybrid)
2. 📋 **PLANNING**: Use `/pdca plan` to create detailed implementation plan
3. 🎨 **DESIGN**: Create mockup or wireframe for key pages
4. 🗄️ **DATABASE**: Write complete schema.sql with sample data
5. 🚀 **START**: Begin Phase 1 implementation

### Recommended PDCA Flow
```
PRD (You are here)
  → /pdca plan          # Break down into tasks
    → /pdca design      # Create detailed design docs
      → /pdca do        # Implementation
        → /pdca analyze # Gap analysis
          → /pdca report # Completion report
```

---

**Document Version**: 1.1
**Last Updated**: 2026-02-07
**Status**: Approved - Ready for implementation planning
**Owner**: Developer (Practice Project)
**Auth Method**: Firebase Google Login ✅
