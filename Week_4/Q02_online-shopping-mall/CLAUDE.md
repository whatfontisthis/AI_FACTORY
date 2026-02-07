# Coupang Clone - Project Intelligence

## Project Level: Dynamic (Fullstack)

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL via Supabase
- **Auth**: Firebase Auth (Google/Social Login)
- **State Management**: TanStack Query (server state) + Zustand (client state)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Architecture
- Decoupled frontend/backend (monorepo structure)
- API-First approach with OpenAPI contracts
- `client/` - React Vite application
- `server/` - Node.js Express API server

## Core Pages (6 Modules)
1. Homepage/Feed - Product grids, categories, promotional banners
2. Login - Firebase social login (Google)
3. Search Results - Filtering (price, rating), sorting
4. Product Details - Image gallery, options, buy/cart actions
5. Shopping Cart - Persistent cart, quantity management
6. Payment - Checkout flow, address selection, mock payment

## Conventions
- Component naming: PascalCase
- File naming: camelCase for utils, PascalCase for components
- API routes: RESTful `/api/v1/{resource}`
- Use TypeScript strict mode
- Atomic Design for UI components

## Key Commands
```bash
# Frontend
cd client && npm run dev

# Backend
cd server && npm run dev
```

## PDCA Documents
- Plan: docs/01-plan/
- Design: docs/02-design/
- Analysis: docs/03-analysis/
- Report: docs/04-report/
