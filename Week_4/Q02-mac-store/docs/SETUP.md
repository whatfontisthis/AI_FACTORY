# Mac Shopping Website - Setup Guide

## 🎉 Implementation Complete!

All code has been generated and is ready for testing. Follow these steps to get your website running.

---

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Supabase Account** (for PostgreSQL database)
3. **Firebase Project** (for Google authentication)
4. **Toss Payments Account** (for payment testing)

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd w4q2-online-shopping
npm install
```

### Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` with your credentials (see sections below)

### Step 3: Set Up Database

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run `database/schema.sql` (creates tables)
4. Run `database/seed.sql` (adds sample Mac products)

### Step 4: Configure Firebase in Frontend

1. Open `public/index.html`
2. Find the `firebaseConfig` object (around line 64)
3. Replace placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id"
};
```

### Step 5: Start the Server

```bash
npm start
```

Visit: `http://localhost:3000`

---

## 🔑 Getting Required Credentials

### A. Supabase PostgreSQL

1. Go to https://supabase.com
2. Create a new project
3. Go to **Project Settings → Database**
4. Copy the **Connection String** (URI mode)
5. Add to `.env` as `DATABASE_URL`

Example:
```
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### B. Firebase Authentication

**1. Create Firebase Project**
- Go to https://console.firebase.google.com
- Click "Add Project"
- Follow setup wizard

**2. Enable Google Authentication**
- Go to **Authentication → Sign-in method**
- Enable **Google**
- Add authorized domains (localhost for testing)

**3. Get Client Config (for frontend)**
- Go to **Project Settings → General**
- Scroll to "Your apps"
- Click **Web app** (</> icon)
- Copy the config object
- Paste into `public/index.html` (replace firebaseConfig)

**4. Get Admin SDK Credentials (for backend)**
- Go to **Project Settings → Service Accounts**
- Click "Generate new private key"
- Download JSON file
- Extract values and add to `.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important:** Keep the `\n` characters in the private key!

### C. Toss Payments (Test Mode)

1. Go to https://developers.tosspayments.com
2. Sign up for free developer account
3. Go to **Dashboard → API keys**
4. Copy **Test Client Key** and **Test Secret Key**
5. Add to `.env`:

```env
TOSS_CLIENT_KEY=test_ck_XXXXXXXXXXXXXXXXXXXXXXXXXX
TOSS_SECRET_KEY=test_sk_XXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Test Card:**
```
Card Number: 4330-1234-1234-1234
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
Password: 12 (any 2 digits)
```

### D. JWT Secret

Generate a random secret:

**Option 1 (OpenSSL):**
```bash
openssl rand -base64 32
```

**Option 2 (Node.js):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:
```env
JWT_SECRET=your-generated-secret-here
```

---

## 📁 Complete .env Example

```env
# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-us-west-1.pooler.supabase.com:5432/postgres

# JWT Secret
JWT_SECRET=W8x3nR9mK2pL5vC7jH4qT6yU1zF0aB3e

# Firebase Admin SDK
FIREBASE_PROJECT_ID=mac-shopping-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc@mac-shopping-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0...\n-----END PRIVATE KEY-----\n"

# Toss Payments (Test Mode)
TOSS_SECRET_KEY=test_sk_abcdefghijklmnopqrstuvwxyz123456
TOSS_CLIENT_KEY=test_ck_abcdefghijklmnopqrstuvwxyz123456

# App Config
PORT=3000
NODE_ENV=development
```

---

## ✅ Testing Checklist

### 1. Database Connection
- [ ] Run server: `npm start`
- [ ] Check console: Should see "✅ Connected to PostgreSQL database"
- [ ] Visit: http://localhost:3000/api/health
- [ ] Should see: `{"status": "ok", ...}`

### 2. Products API
- [ ] Visit: http://localhost:3000/api/products
- [ ] Should see: List of Mac products
- [ ] If empty: Run `database/seed.sql` in Supabase SQL editor

### 3. Frontend
- [ ] Visit: http://localhost:3000
- [ ] Should see: "Mac Store" with product grid
- [ ] Products should load from API

### 4. Google Login
- [ ] Click "Sign In" button
- [ ] Should see: Google login popup
- [ ] After login: Should see your profile picture
- [ ] Check console: Should see "✅ User login: your@email.com"

### 5. Shopping Cart
- [ ] Click "Add to Cart" on any product
- [ ] Cart sidebar should slide in
- [ ] Cart badge should show count
- [ ] Try adjusting quantity
- [ ] Try removing items

### 6. Checkout Flow
- [ ] Add items to cart
- [ ] Click "Proceed to Checkout"
- [ ] Fill shipping form
- [ ] Toss widget should load
- [ ] Use test card (4330-1234-1234-1234)
- [ ] Should redirect to confirmation page

---

## 🐛 Troubleshooting

### "Firebase not configured"
- Check `public/index.html` - Replace ALL placeholder values in `firebaseConfig`
- Restart server after changes

### "Database connection failed"
- Verify `DATABASE_URL` in `.env`
- Check Supabase project is active
- Ensure IP is allowed (Supabase → Settings → Database → Connection pooling)

### "Firebase Admin SDK error"
- Check `FIREBASE_PRIVATE_KEY` has `\n` characters (not actual line breaks)
- Verify all three Firebase env vars are set
- Download fresh service account JSON if needed

### "No products showing"
- Run `database/seed.sql` in Supabase SQL Editor
- Check browser console for errors
- Visit `/api/products` directly to test API

### "CORS error"
- Server must be running on same origin as frontend
- For Vercel deployment, add frontend URL to CORS config

---

## 📦 Project Structure

```
w4q2-online-shopping/
├── server.js                   ✅ Express server (COMPLETE)
├── middleware/
│   ├── auth.js                 ✅ JWT verification (COMPLETE)
│   └── errorHandler.js         ✅ Global error handler (COMPLETE)
├── routes/
│   ├── products.js             ✅ Product endpoints (COMPLETE)
│   ├── auth.js                 ✅ Firebase auth (COMPLETE)
│   ├── cart.js                 ✅ Cart CRUD (COMPLETE)
│   └── payment.js              ✅ Toss payment (COMPLETE)
├── controllers/
│   ├── productController.js    ✅ Product logic (COMPLETE)
│   ├── authController.js       ✅ Auth logic (COMPLETE)
│   ├── cartController.js       ✅ Cart logic (COMPLETE)
│   └── paymentController.js    ✅ Payment logic (COMPLETE)
├── database/
│   ├── db.js                   ✅ PostgreSQL connection (COMPLETE)
│   ├── schema.sql              ✅ Table definitions (COMPLETE)
│   └── seed.sql                ✅ Sample data (COMPLETE)
├── public/
│   ├── index.html              ✅ React SPA with all components (COMPLETE)
│   └── images/                 ⏳ Add product images here (OPTIONAL)
├── package.json                ✅ Dependencies (COMPLETE)
├── vercel.json                 ✅ Deployment config (COMPLETE)
├── .env.example                ✅ Environment template (COMPLETE)
└── README.md                   ✅ Project documentation (COMPLETE)
```

---

## 🚀 Deployment to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Project
```bash
vercel link
```

### 4. Add Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env`:
- `DATABASE_URL`
- `JWT_SECRET`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `TOSS_SECRET_KEY`
- `TOSS_CLIENT_KEY`

### 5. Deploy
```bash
vercel --prod
```

### 6. Update Firebase
Add your Vercel domain to Firebase authorized domains:
- Firebase Console → Authentication → Settings → Authorized domains
- Add: `your-project.vercel.app`

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List all products |
| GET | `/api/products/:id` | No | Get product detail |
| POST | `/api/auth/firebase` | No | Google login |
| GET | `/api/cart` | Yes | Get cart |
| POST | `/api/cart/add` | Yes | Add to cart |
| PATCH | `/api/cart/update/:id` | Yes | Update quantity |
| DELETE | `/api/cart/remove/:id` | Yes | Remove item |
| POST | `/api/checkout/create` | Yes | Create order |
| POST | `/api/payment/toss/confirm` | Yes | Confirm payment |
| GET | `/api/orders/:id` | Yes | Get order |

---

## 💡 Next Steps

1. **Test Everything** - Follow testing checklist above
2. **Add Product Images** - Place images in `public/images/`
3. **Customize Design** - Edit Tailwind classes in `index.html`
4. **Deploy** - Follow Vercel deployment steps
5. **Add Features** - Product search, order history, etc.

---

## 📞 Support

If you encounter issues:
1. Check console logs (both browser and server)
2. Verify all environment variables are set correctly
3. Ensure database schema and seed data are loaded
4. Test API endpoints directly (use Postman or curl)

---

**Implementation completed by Claude (bkit PDCA)**
**Date:** 2026-02-07
**Status:** ✅ Ready for testing
