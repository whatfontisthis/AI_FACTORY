# Coupang Clone - Project Plan

## Overview
High-fidelity clone of the Coupang web platform focusing on essential e-commerce workflows. Full-stack web application with decoupled architecture.

## Goals
- Practice core full-stack engineering patterns
- Implement 6 key e-commerce modules
- API-First development approach
- Clean separation of frontend/backend concerns

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + Vite + TypeScript | Client-side state focus, fast HMR |
| Backend | Node.js + Express + TypeScript | Business logic, payment orchestration |
| Database | PostgreSQL via Supabase | Relational integrity, real-time features |
| Auth | Firebase Auth | Reliable Google/social login |
| State | TanStack Query + Zustand | Server + client state management |
| Styling | Tailwind CSS | Rapid UI development |
| Deploy | Vercel | Seamless CI/CD |

## Core Modules (6 Pages)

### 1. Homepage/Feed
- Dynamic product grids
- Category navigation
- "Rocket Delivery" promotional banners
- Responsive layout

### 2. Login Page
- Firebase Google login integration
- Session management
- Redirect to personalized dashboard

### 3. Search Results
- Product list view
- Filtering: price range, rating
- Sorting: price asc/desc, rating, newest
- Pagination

### 4. Product Details
- Image gallery (carousel)
- Price display with discount
- Option selection (size/color)
- "Buy Now" vs "Add to Cart" actions
- Rating and review count display

### 5. Shopping Cart
- Persistent cart (Supabase DB for logged-in users)
- Quantity adjustments
- Price summation with discounts
- Remove items

### 6. Payment Page
- Checkout flow from cart
- Delivery address selection/management
- Order summary
- Mock payment gateway integration

## Architecture

```
[React SPA] <---> [Express API] <---> [Supabase PostgreSQL]
     |                  |
     v                  v
[Firebase Auth]   [Firebase Admin SDK]
```

- Frontend: `client/` (Vite dev server on :3000)
- Backend: `server/` (Express API on :4000)
- Vite proxies `/api` calls to backend

## Milestones

| Phase | Description | Modules |
|-------|-------------|---------|
| Phase 1 | Schema & API Design | Data model, API spec |
| Phase 2 | Auth & User Flow | Login, user sync |
| Phase 3 | Product Catalog | Homepage, Search, Product Detail |
| Phase 4 | Cart & Checkout | Cart, Payment |
| Phase 5 | Polish & Deploy | UI refinement, Vercel deploy |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Firebase + Supabase dual complexity | Clear auth boundary: Firebase for identity only, Supabase for data |
| Cart state sync issues | Server-authoritative cart for logged-in users |
| Payment security | Mock gateway only, no real payment processing |
