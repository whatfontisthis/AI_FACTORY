import { useQuery } from '@tanstack/react-query';
import { Navigate, Link } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface RawOrder {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    price: number;
    quantity: number;
  }[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '결제대기', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: '결제완료', color: 'bg-blue-100 text-blue-700' },
  shipping: { label: '배송중', color: 'bg-coupang-rocket/10 text-coupang-rocket' },
  delivered: { label: '배송완료', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '주문취소', color: 'bg-gray-100 text-gray-500' },
};

export function OrdersPage() {
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get<{ orders: RawOrder[] }>('/orders');
      return res.data.orders;
    },
    enabled: !!user,
  });

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">주문내역</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow-sm">
                <div className="h-5 w-1/3 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="mb-4 h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium text-gray-500">주문내역이 없습니다</p>
            <Link to="/" className="mt-4 rounded-md bg-coupang-blue px-8 py-3 text-white hover:bg-blue-600">쇼핑하러 가기</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] ?? { label: '알 수 없음', color: 'bg-gray-100 text-gray-500' };
              const date = new Date(order.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <div key={order.id} className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{date}</p>
                      <p className="mt-0.5 text-xs text-gray-300">주문번호: {order.id.slice(0, 8)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.product_name}</span>
                        <span className="text-gray-500">
                          {formatPrice(item.price)}원 x {item.quantity}개
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t pt-3 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      총 {formatPrice(order.total_price)}원
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
