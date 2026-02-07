import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice, CONFIG } from '@/lib/utils';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useState } from 'react';

export function CartPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { items, isLoading, totalPrice, totalItems, updateQuantity, removeFromCart } = useCart();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const deliveryFee = totalPrice >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <ConfirmModal
        open={!!deleteTarget}
        title="상품 삭제"
        message="장바구니에서 이 상품을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={() => { if (deleteTarget) removeFromCart.mutate(deleteTarget); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          장바구니
          {totalItems > 0 && <span className="ml-2 text-lg font-normal text-gray-500">({totalItems}개)</span>}
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-4 rounded-lg bg-white p-4 shadow-sm">
                <div className="h-24 w-24 rounded bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="mb-4 h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-lg font-medium text-gray-500">장바구니가 비어있습니다</p>
            <Link to="/" className="mt-4 rounded-md bg-coupang-blue px-8 py-3 text-white hover:bg-blue-600">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {items.map((item) => {
                const price = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                    <Link to={`/products/${item.productId}`} className="shrink-0">
                      <img src={item.product.imageUrl} alt={item.product.name} loading="lazy" className="h-24 w-24 rounded-md object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <Link to={`/products/${item.productId}`} className="text-sm font-medium text-gray-800 hover:text-coupang-blue">
                        {item.product.name}
                      </Link>
                      {item.product.isRocketDelivery && (
                        <span className="mt-1 text-xs font-medium text-coupang-rocket">로켓배송</span>
                      )}
                      {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                        <p className="mt-1 text-xs text-gray-400">
                          {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-50"
                          >-</button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}
                            className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-sm hover:bg-gray-50"
                          >+</button>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-lg font-bold text-gray-900">{formatPrice(price * item.quantity)}원</p>
                          <button onClick={() => setDeleteTarget(item.id)} className="text-sm text-gray-400 hover:text-coupang-red">삭제</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-900">주문 요약</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">상품 금액</span>
                    <span className="font-medium">{formatPrice(totalPrice)}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">배송비</span>
                    <span className={deliveryFee === 0 ? 'font-medium text-coupang-rocket' : 'font-medium'}>
                      {deliveryFee === 0 ? '무료' : `${formatPrice(deliveryFee)}원`}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-gray-400">{formatPrice(CONFIG.FREE_SHIPPING_THRESHOLD - totalPrice)}원 더 구매 시 무료배송</p>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-bold">총 결제 금액</span>
                      <span className="text-xl font-extrabold text-coupang-blue">{formatPrice(finalTotal)}원</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/payment')}
                  className="mt-6 w-full rounded-lg bg-coupang-blue py-4 text-lg font-bold text-white transition-colors hover:bg-blue-600"
                >주문하기 ({totalItems}개)</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
