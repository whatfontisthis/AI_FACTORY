# mac-shopping-website Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation)
>
> **Project**: w4q2-online-shopping
> **Version**: 1.0.0
> **Analyst**: Claude (bkit PDCA gap-detector)
> **Date**: 2026-02-08
> **Design Doc**: [mac-shopping-website.design.md](../02-design/features/mac-shopping-website.design.md)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Comprehensive Check-phase gap analysis comparing the design document against the actual implementation to identify missing features, inconsistencies, and quality issues before proceeding to the Act phase.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/mac-shopping-website.design.md`
- **Implementation Path**: Full project (`server.js`, `controllers/`, `routes/`, `middleware/`, `database/`, `public/index.html`)
- **Analysis Date**: 2026-02-08

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| API Implementation Match | 95% | Passed |
| Database Schema Match | 93% | Passed |
| Frontend Component Match | 35% | FAILED |
| Frontend Integration Match | 30% | FAILED |
| State Management Match | 50% | FAILED |
| Error Handling Match | 65% | FAILED |
| Security Compliance | 40% | FAILED |
| **Overall Design Match** | **58%** | **FAILED** |

---

## 3. Gap Analysis (Design vs Implementation)

### 3.1 API Endpoints

| Design Endpoint | Implementation | Status | Notes |
|-----------------|---------------|--------|-------|
| GET /api/products | `routes/products.js` -> `productController.getAllProducts` | Match | Response format matches: `{ products: [...] }` |
| GET /api/products/:id | `routes/products.js` -> `productController.getProductById` | Match | Returns `{ product: {...} }`, 404 error handled |
| POST /api/auth/firebase | `routes/auth.js` -> `authController.verifyFirebaseToken` | Match | Token verification + JWT issuance works as designed |
| POST /api/cart/add | `routes/cart.js` -> `cartController.addItem` | Match | Returns `{ success, cart }` as designed |
| GET /api/cart | `routes/cart.js` -> `cartController.getCart` | Match | Returns `{ items, subtotal, tax, total }` |
| PATCH /api/cart/update/:id | `routes/cart.js` -> `cartController.updateItem` | Match | Returns `{ success, item }` |
| DELETE /api/cart/remove/:id | `routes/cart.js` -> `cartController.removeItem` | Match | Returns `{ success, message }` |
| POST /api/checkout/create | `routes/payment.js` -> `paymentController.createCheckout` | Match | Transaction-based order creation |
| POST /api/payment/toss/confirm | `routes/payment.js` -> `paymentController.confirmTossPayment` | Match | Toss API verification + order update |
| GET /api/orders/:id | `routes/payment.js` -> `paymentController.getOrder` | Match | Returns `{ order, items }` |
| - | GET /api/products/categories | Added | Not in design, returns category list with counts |
| - | GET /api/products/category/:category | Added | Not in design, alternative category filter |
| - | GET /api/auth/verify | Added | Not in design, JWT verification test endpoint |
| - | DELETE /api/cart/clear | Added | Not in design, clears entire cart |
| - | POST /api/payment/webhook | Added | Not in design, Toss webhook handler |
| - | GET /api/orders | Added | Not in design, order history list |
| - | GET /api/health | Added | Not in design, health check endpoint |

**API Match Rate: 10/10 designed endpoints implemented (100%). 7 additional endpoints added.**

### 3.2 Data Model

| Table | Design | Implementation (schema.sql) | Status |
|-------|--------|----------------------------|--------|
| w4q2_users | 7 columns, 2 indexes, email constraint | 7 columns, 2 indexes, email constraint | Match |
| w4q2_products | 8 columns, 2 indexes, category constraint | 8 columns, 2 indexes, category constraint | Match |
| w4q2_cart_items | 7 columns, 2 indexes, unique constraint, trigger | 7 columns, 2 indexes, unique index (functional), trigger | Partial match |
| w4q2_orders | 10 columns, 4 indexes, status constraint | 10 columns, 4 indexes, status constraint | Partial match |
| w4q2_order_items | 7 columns, 2 indexes | 7 columns, 2 indexes | Match |

**Data Model Differences:**

| Item | Design | Implementation | Impact |
|------|--------|----------------|--------|
| cart_items unique constraint | `UNIQUE(user_id, product_id, config)` | `CREATE UNIQUE INDEX ... ON (user_id, product_id, (config::text))` | Low - functional equivalent using text cast |
| orders chk_total_calculation | `CHECK (total_amount = subtotal + tax)` | Not implemented | Medium - no database-level total validation |
| orders chk_paid_at | `CHECK ((status = 'paid' AND paid_at IS NOT NULL) OR (status != 'paid'))` | Not implemented | Medium - no database-level status/date consistency |

### 3.3 Frontend Component Structure

| Design Component | Implementation Status | Location | Notes |
|------------------|----------------------|----------|-------|
| `<App>` | Implemented | `public/index.html` L643-655 | Present |
| `<AuthProvider>` | Implemented | `public/index.html` L122-197 | Present |
| `<CartProvider>` | Implemented | `public/index.html` L202-302 | Present |
| `<Router>` | **NOT IMPLEMENTED** | - | No client-side routing; single-page only |
| `<Navigation>` | Implemented | `public/index.html` L309-372 | Present but no mobile hamburger menu |
| `<HeroSection>` | Implemented | `public/index.html` L583-592 | Matches design text |
| `<CategoryFilter>` | **NOT IMPLEMENTED** | - | No pill buttons for category filtering |
| `<ProductGrid>` | Implemented | `public/index.html` L607-636 | 3-column grid with responsive layout |
| `<ProductCard>` | Implemented | Inline in ProductGrid | Matches design styling |
| `<ProductDetailPage>` | **NOT IMPLEMENTED** | - | No product detail view |
| `<CheckoutPage>` | **NOT IMPLEMENTED** | - | No checkout page |
| `<OrderConfirmationPage>` | **NOT IMPLEMENTED** | - | No confirmation page |
| `<CartSidebar>` | Implemented | `public/index.html` L443-554 | Slide-in with backdrop |
| `<LoginModal>` | Implemented | `public/index.html` L375-440 | Google sign-in with error handling |
| `<ToastContainer>` | **NOT IMPLEMENTED** | - | No toast notification system |
| `<LoadingSpinner>` | Implemented | CSS `.spinner` class | Basic spinner |

**Component Match Summary:**
- Implemented: 8 of 23 core components (35%)
- Not Implemented: 15 of 23 core components (65%)

### 3.4 State Management

| Design Feature | Implementation Status | Notes |
|----------------|----------------------|-------|
| CartContext.addToCart | **Partial** | Local state only; TODO comment for backend API call |
| CartContext.updateQuantity | **Partial** | Local state only; TODO comment for backend API call |
| CartContext.removeItem | **Partial** | Local state only; TODO comment for backend API call |
| CartContext.syncCart | **NOT IMPLEMENTED** | No cart sync after login |
| AuthContext.refreshToken | **NOT IMPLEMENTED** | No auto-refresh before expiry |

**State Management Match Rate: ~50%**

---

## 4. Code Quality Analysis

### 4.1 Security Issues

| Severity | File | Location | Issue | Recommendation |
|----------|------|----------|-------|----------------|
| CRITICAL | `.env.example` | Lines 2,5,8-9,12-13,17-18 | Contains real credentials (database password, API keys, secrets) instead of empty placeholders | Replace all values with empty strings or placeholder text |
| CRITICAL | `public/index.html` | Lines 96-98 | Firebase API key hardcoded directly in source | Move to environment variable, inject at build time |
| HIGH | `.env` | Line 5 | JWT_SECRET is weak: "shasha1234" | Use cryptographically random 32+ byte secret |
| MEDIUM | `public/index.html` | L249 | `addToCart` does not call backend API for authenticated users (TODO comment) | Implement backend cart sync |

### 4.2 Code Smells

| Type | File | Location | Description | Severity |
|------|------|----------|-------------|----------|
| Monolithic file | `public/index.html` | L87-659 | All React components in single `<script>` tag (572 lines) | HIGH - Should be split |
| TODO comments | `public/index.html` | L249, L261, L274 | Backend API integration incomplete | HIGH |
| Missing routing | `public/index.html` | L643-655 | App renders only HomePage, no routing | HIGH |
| No image assets | `public/` | - | No actual product images, using SVG placeholders | MEDIUM |

---

## 5. Missing Features Summary

### 5.1 Missing Frontend Components (Design specified, not implemented)

| # | Component | Design Reference | Impact |
|---|-----------|-----------------|--------|
| 1 | Router (client-side routing) | Section 3.1 | Critical - Only home page accessible |
| 2 | CategoryFilter | Section 2.1A, 3.2 | High - No way to filter products by category |
| 3 | ProductDetailPage | Section 2.1B, 3.2 | Critical - Cannot view product details |
| 4 | CheckoutPage | Section 2.1D, 3.2 | Critical - Cannot complete purchases |
| 5 | OrderConfirmationPage | Section 2.1E, 3.2 | High - No order confirmation view |
| 6 | ToastContainer | Section 3.1 | Medium - No user feedback system |

### 5.2 Missing Frontend Features

| # | Feature | Design Reference | Impact |
|---|---------|-----------------|--------|
| 1 | Client-side routing | Section 3.1 | Critical |
| 2 | Cart backend API integration | Section 6.2 | High - Cart only works locally |
| 3 | Cart sync after login | Section 6.2 | High - Guest cart lost on login |
| 4 | Mobile hamburger menu | Section 9.2 | Medium |
| 5 | Frontend error handler (handleApiError) | Section 10.2 | Medium |

---

## 6. Overall Score

```
+---------------------------------------------+
|  Overall Match Rate: 58%                     |
+---------------------------------------------+
|  Backend API:           95%                  |
|  Database Schema:       93%                  |
|  Frontend Components:   35%                  |
|  Frontend Integration:  30%                  |
|  State Management:      50%                  |
|  Security:              40%                  |
+---------------------------------------------+
|  Target: >= 90%                              |
|  Result: FAILED (32 points below target)     |
+---------------------------------------------+
```

---

## 7. Recommended Actions

### 7.1 Immediate Actions (Critical - Required for functionality)

| Priority | Item | Details |
|----------|------|---------|
| 1 | Implement client-side routing | Add hash-based or history-based routing to navigate between Home, Product Detail, Checkout, and Order Confirmation pages |
| 2 | Implement ProductDetailPage | Create product detail view with ImageGallery, SpecsTable, ConfigSelector as designed in Section 2.1B |
| 3 | Implement CheckoutPage | Create checkout flow with ShippingForm, OrderSummary, and TossPaymentWidget as designed in Section 2.1D |
| 4 | Implement OrderConfirmationPage | Create order confirmation display as designed in Section 2.1E |
| 5 | Fix cart backend integration | Replace TODO comments in addToCart, updateQuantity, removeItem with actual API calls |
| 6 | Remove credentials from .env.example | Replace all real values with empty placeholders |
| 7 | Remove hardcoded Firebase API key | Move Firebase config to environment-injected variables |

### 7.2 Short-term Actions (High - Required for design match)

| Priority | Item | Details |
|----------|------|---------|
| 1 | Implement CategoryFilter component | Pill-style buttons for product category filtering |
| 2 | Implement cart sync after login | Merge guest cart with server cart on authentication |
| 3 | Implement ToastContainer | User feedback for add-to-cart, errors, and success messages |
| 4 | Add missing database constraints | chk_total_calculation and chk_paid_at on w4q2_orders |

---

## 8. Next Steps

- [ ] Fix all Critical security issues (credentials exposure)
- [ ] Implement missing Critical frontend pages (ProductDetail, Checkout, OrderConfirmation)
- [ ] Implement client-side routing
- [ ] Complete cart backend API integration (remove TODO comments)
- [ ] Implement cart sync after login
- [ ] Re-run gap analysis to achieve >= 90% match rate
- [ ] If match rate >= 90%, proceed to Report phase (`/pdca report mac-shopping-website`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-08 | Initial comprehensive gap analysis | Claude (bkit PDCA) |
