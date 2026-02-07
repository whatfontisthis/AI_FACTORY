import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/ui/Header';

export function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">결제에 실패했습니다</h1>
        <p className="mt-2 text-gray-500">{message || '결제 중 문제가 발생했습니다'}</p>
        {code && <p className="mt-1 text-sm text-gray-400">오류 코드: {code}</p>}

        <div className="mt-8 flex gap-3">
          <Link
            to="/cart"
            className="rounded-lg border-2 border-gray-300 px-8 py-3 text-lg font-bold text-gray-700 hover:bg-gray-50"
          >
            장바구니로 돌아가기
          </Link>
          <Link
            to="/"
            className="rounded-lg bg-coupang-blue px-8 py-3 text-lg font-bold text-white hover:bg-blue-600"
          >
            홈으로 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
