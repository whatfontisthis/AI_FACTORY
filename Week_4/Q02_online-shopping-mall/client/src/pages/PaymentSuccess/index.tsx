import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('잘못된 결제 정보입니다');
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await api.post('/payments/confirm', {
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        setOrderInfo(response.data);
        setStatus('success');
      } catch (error: any) {
        console.error('결제 승인 실패:', error);
        setStatus('error');
        setErrorMessage(error.response?.data?.message || '결제 승인에 실패했습니다');
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 h-16 w-16 animate-spin rounded-full border-4 border-coupang-blue border-t-transparent"></div>
          <p className="text-lg text-gray-700">결제를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">결제 실패</h1>
          <p className="mt-2 text-gray-500">{errorMessage}</p>
          <Link
            to="/cart"
            className="mt-6 rounded-lg bg-coupang-blue px-8 py-3 text-lg font-bold text-white hover:bg-blue-600"
          >
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">주문이 완료되었습니다!</h1>
        <p className="mt-2 text-gray-500">주문번호: {orderInfo?.orderId}</p>
        <p className="mt-1 text-sm text-coupang-rocket">로켓배송 상품은 내일 새벽 도착 예정!</p>

        {orderInfo && (
          <div className="mt-8 w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">결제 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">결제 금액</span>
                <span className="font-medium">{formatPrice(orderInfo.amount)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">결제 수단</span>
                <span className="font-medium">{orderInfo.method || '카드'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">결제 시각</span>
                <span className="font-medium">
                  {new Date(orderInfo.approvedAt || Date.now()).toLocaleString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            to="/orders"
            className="rounded-lg border-2 border-coupang-blue px-8 py-3 text-lg font-bold text-coupang-blue hover:bg-blue-50"
          >
            주문내역 보기
          </Link>
          <Link
            to="/"
            className="rounded-lg bg-coupang-blue px-8 py-3 text-lg font-bold text-white hover:bg-blue-600"
          >
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}
