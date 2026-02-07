import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('@/pages/Login').then((m) => ({ default: m.LoginPage })));
const SearchPage = lazy(() => import('@/pages/Search').then((m) => ({ default: m.SearchPage })));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail').then((m) => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('@/pages/Cart').then((m) => ({ default: m.CartPage })));
const PaymentPage = lazy(() => import('@/pages/Payment').then((m) => ({ default: m.PaymentPage })));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccess').then((m) => ({ default: m.PaymentSuccessPage })));
const PaymentFailPage = lazy(() => import('@/pages/PaymentFail').then((m) => ({ default: m.PaymentFailPage })));
const OrdersPage = lazy(() => import('@/pages/Orders').then((m) => ({ default: m.OrdersPage })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-coupang-blue border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/fail" element={<PaymentFailPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
