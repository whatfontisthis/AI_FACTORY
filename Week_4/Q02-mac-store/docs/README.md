# Mac Shopping Website

Apple-inspired e-commerce practice project built with React (CDN), Express, PostgreSQL, Firebase Auth, and Toss Payments.

## Features

- 🛍️ Browse Mac products (MacBook Air, Pro, iMac, Mac mini, Mac Studio)
- 🔍 Product detail pages with configurations
- 🛒 Shopping cart with real-time totals
- 🔐 Firebase Google authentication
- 💳 Toss Payments integration (test mode)
- 📱 Responsive Apple-style design
- ⚡ Serverless deployment on Vercel

## Tech Stack

**Frontend**
- React 18 (CDN - no build process)
- Tailwind CSS (CDN)
- Babel Standalone (in-browser JSX)
- Firebase Auth SDK

**Backend**
- Node.js + Express 5
- PostgreSQL (Supabase)
- JWT authentication
- Firebase Admin SDK

**Payment**
- Toss Payments (Test mode)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required credentials:**
- Supabase PostgreSQL connection string
- Firebase project credentials (Admin SDK + Client config)
- Toss Payments test keys
- JWT secret

### 3. Set Up Database

Run the schema and seed files in your Supabase SQL editor:

```bash
# In Supabase dashboard, run:
database/schema.sql  # Creates tables
database/seed.sql    # Inserts sample products
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Project Structure

```
w4q2-online-shopping/
├── server.js                 # Express API server
├── middleware/
│   ├── auth.js              # JWT verification
│   └── errorHandler.js      # Global error handler
├── routes/
│   ├── products.js          # Product endpoints
│   ├── auth.js              # Authentication
│   ├── cart.js              # Shopping cart
│   └── payment.js           # Toss payment
├── controllers/
│   ├── productController.js
│   ├── authController.js
│   ├── cartController.js
│   └── paymentController.js
├── database/
│   ├── db.js                # PostgreSQL connection
│   ├── schema.sql           # Table definitions
│   └── seed.sql             # Sample data
├── public/
│   ├── index.html           # React SPA (CDN-based)
│   └── images/              # Product images
├── package.json
├── vercel.json              # Deployment config
└── README.md
```

## API Endpoints

### Products
- `GET /api/products` - List all products (with ?category filter)
- `GET /api/products/:id` - Get product detail

### Authentication
- `POST /api/auth/firebase` - Verify Firebase token, issue JWT

### Cart (Auth required)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PATCH /api/cart/update/:id` - Update quantity
- `DELETE /api/cart/remove/:id` - Remove item

### Checkout & Payment (Auth required)
- `POST /api/checkout/create` - Create order and checkout session
- `POST /api/payment/toss/confirm` - Confirm Toss payment
- `POST /api/payment/webhook` - Toss webhook handler
- `GET /api/orders/:id` - Get order details

## Database Tables

All tables use `w4q2_` prefix:

- `w4q2_users` - User accounts
- `w4q2_products` - Mac product catalog
- `w4q2_cart_items` - Shopping cart items
- `w4q2_orders` - Order records
- `w4q2_order_items` - Order line items

## Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Google authentication
3. Download Admin SDK credentials (Project Settings → Service Accounts)
4. Copy client config (Project Settings → General → Your apps)
5. Add credentials to `.env`

## Toss Payments Setup

1. Register at https://developers.tosspayments.com
2. Get test API keys (Dashboard → API keys)
3. Add to `.env`:
   - `TOSS_CLIENT_KEY` (for frontend)
   - `TOSS_SECRET_KEY` (for backend)

**Test Card:**
```
Card: 4330-1234-1234-1234
Expiry: Any future date
CVC: Any 3 digits
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link project:
```bash
vercel link
```

3. Add environment variables in Vercel dashboard

4. Deploy:
```bash
vercel --prod
```

## Development Notes

- CDN-based React = No build process needed
- Babel Standalone = In-browser JSX transformation
- All API routes start with `/api/`
- Frontend is served from `/public/`
- Database tables have `w4q2_` prefix to avoid conflicts

## License

MIT - Practice project for learning purposes
