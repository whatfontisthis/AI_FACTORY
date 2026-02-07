import { useState, useEffect, useRef } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { Header } from '@/components/ui/Header';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { formatPrice, CONFIG } from '@/lib/utils';

interface RawAddress {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  zip_code: string;
  address1: string;
  address2: string | null;
  is_default: boolean;
}

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

export function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, totalPrice, totalItems } = useCart();

  // Debug: Check if CLIENT_KEY is loaded
  console.log('TossPayments CLIENT_KEY:', CLIENT_KEY);
  console.log('Total items:', totalItems);
  console.log('Final total:', totalPrice);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [widgetsReady, setWidgetsReady] = useState(false);

  // TossPayments widgets ref
  const widgetsRef = useRef<any>(null);
  const isRenderedRef = useRef(false);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    label: '집',
    recipient: '',
    phone: '',
    zipCode: '',
    address1: '',
    address2: '',
    isDefault: true,
  });

  // Fetch addresses
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get<{ addresses: RawAddress[] }>('/addresses');
      return res.data.addresses;
    },
    enabled: !!user,
  });

  // Select default address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Create address mutation
  const createAddress = useMutation({
    mutationFn: async () => {
      return api.post('/addresses', addressForm);
    },
    onSuccess: async (res) => {
      setShowAddressForm(false);
      await refetchAddresses();
      setSelectedAddressId(res.data.address.id);
    },
  });

  // Calculate delivery fee and total
  const deliveryFee = totalPrice >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
  const finalTotal = totalPrice + deliveryFee;

  // Initialize TossPayments Widgets
  useEffect(() => {
    console.log('useEffect - Initialize widgets:', { user: !!user, itemsLength: items.length, finalTotal });

    if (!user || items.length === 0 || !finalTotal) {
      console.log('Skipping widget initialization - conditions not met');
      return;
    }

    if (!CLIENT_KEY) {
      console.error('CLIENT_KEY is not defined!');
      return;
    }

    const initializeWidgets = async () => {
      try {
        console.log('Loading TossPayments with CLIENT_KEY:', CLIENT_KEY);
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        console.log('TossPayments loaded successfully');

        // 비회원은 ANONYMOUS, 회원은 user.uid 사용
        const customerKey = user.uid || 'ANONYMOUS';
        console.log('Customer key:', customerKey);

        widgetsRef.current = tossPayments.widgets({ customerKey });
        console.log('Widgets initialized');

        // Trigger rendering
        setWidgetsReady(true);
      } catch (error) {
        console.error('TossPayments 초기화 실패:', error);
      }
    };

    initializeWidgets();
  }, [user, items.length, finalTotal]);

  // Render widgets when amount changes
  useEffect(() => {
    console.log('useEffect - Render widgets:', { widgetsReady, hasWidgets: !!widgetsRef.current, finalTotal, isRendered: isRenderedRef.current });

    if (!widgetsReady || !widgetsRef.current || !finalTotal) {
      console.log('Skipping widget rendering - conditions not met');
      return;
    }

    const renderWidgets = async () => {
      try {
        console.log('Setting amount:', finalTotal);
        await widgetsRef.current.setAmount({
          currency: 'KRW',
          value: finalTotal,
        });

        // 위젯은 한 번만 렌더링
        if (!isRenderedRef.current) {
          console.log('Rendering payment methods...');
          await widgetsRef.current.renderPaymentMethods({
            selector: '#payment-method',
            variantKey: 'DEFAULT',
          });

          console.log('Rendering agreement...');
          await widgetsRef.current.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT',
          });

          isRenderedRef.current = true;
          console.log('Widgets rendered successfully');
        } else {
          console.log('Widgets already rendered, only updating amount');
        }
      } catch (error) {
        console.error('위젯 렌더링 실패:', error);
      }
    };

    renderWidgets();
  }, [widgetsReady, finalTotal]);

  // Handle payment request
  const handlePayment = async () => {
    if (!widgetsRef.current || !selectedAddressId) {
      alert('배송지를 선택해주세요');
      return;
    }

    try {
      // 1. 서버에 임시 주문 생성 (orderId 받기)
      const orderResponse = await api.post('/orders/prepare', {
        shippingAddressId: selectedAddressId,
        amount: finalTotal,
      });

      const { orderId } = orderResponse.data;

      // 2. 토스페이먼츠 결제창 호출
      await widgetsRef.current.requestPayment({
        orderId,
        orderName: items.length === 1
          ? items[0].product.name
          : `${items[0].product.name} 외 ${items.length - 1}건`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: user?.email || '',
        customerName: user?.displayName || '',
      });
    } catch (error: any) {
      if (error.code === 'USER_CANCEL') {
        // 사용자가 결제를 취소함
        console.log('결제가 취소되었습니다');
      } else {
        console.error('결제 요청 실패:', error);
        alert('결제 요청에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-gray-500">결제할 상품이 없습니다</p>
          <Link
            to="/"
            className="mt-4 rounded-md bg-coupang-blue px-6 py-2 text-white"
          >
            쇼핑하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">주문/결제</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery Address Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">배송지</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-sm text-coupang-blue hover:underline"
                >
                  {showAddressForm ? '취소' : '+ 새 배송지 추가'}
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <div className="mb-4 space-y-3 rounded-lg border border-blue-100 bg-blue-50/30 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">배송지명</label>
                      <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="예: 집, 회사"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">받는 분</label>
                      <input
                        type="text"
                        value={addressForm.recipient}
                        onChange={(e) => setAddressForm({ ...addressForm, recipient: e.target.value })}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="이름"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">연락처</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">우편번호</label>
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="12345"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-medium text-gray-600">주소</label>
                      <input
                        type="text"
                        value={addressForm.address1}
                        onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="도로명 주소"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">상세주소</label>
                    <input
                      type="text"
                      value={addressForm.address2}
                      onChange={(e) => setAddressForm({ ...addressForm, address2: e.target.value })}
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="아파트명, 동/호수"
                    />
                  </div>
                  <button
                    onClick={() => createAddress.mutate()}
                    disabled={createAddress.isPending || !addressForm.recipient || !addressForm.address1}
                    className="rounded-md bg-coupang-blue px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {createAddress.isPending ? '저장 중...' : '배송지 저장'}
                  </button>
                </div>
              )}

              {/* Saved Addresses */}
              {addresses && addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-coupang-blue bg-blue-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{addr.label}</span>
                          {addr.is_default && (
                            <span className="rounded bg-coupang-blue/10 px-2 py-0.5 text-xs text-coupang-blue">
                              기본
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-700">
                          {addr.recipient} · {addr.phone}
                        </p>
                        <p className="text-sm text-gray-500">
                          [{addr.zip_code}] {addr.address1} {addr.address2 || ''}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <p className="text-sm text-gray-400">
                    등록된 배송지가 없습니다. 새 배송지를 추가해주세요.
                  </p>
                )
              )}
            </div>

            {/* Order Items */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">주문 상품 ({totalItems}개)</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const price = item.product.discountPrice ?? item.product.price;
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">수량: {item.quantity}개</p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(price * item.quantity)}원</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment Summary & Widgets */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">결제 금액</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 금액</span>
                  <span>{formatPrice(totalPrice)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">배송비</span>
                  <span className={deliveryFee === 0 ? 'text-coupang-rocket' : ''}>
                    {deliveryFee === 0 ? '무료' : `${formatPrice(deliveryFee)}원`}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold">총 결제 금액</span>
                    <span className="text-xl font-extrabold text-coupang-blue">
                      {formatPrice(finalTotal)}원
                    </span>
                  </div>
                </div>
              </div>

              {/* TossPayments Widgets */}
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-gray-700">결제 수단</h3>

                {/* 테스트 환경 안내 */}
                <div className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2.5">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold">⚠️ 테스트 환경</span> - 토스페이만 가능합니다.
                    카카오페이/네이버페이/페이코/신용카드/체크카드 등은 동작하지 않습니다.
                    실제로 결제되지 않습니다.
                  </p>
                </div>

                <div id="payment-method" className="rounded-lg border border-gray-200"></div>
                <div id="agreement" className="mt-4"></div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedAddressId}
                className="mt-6 w-full rounded-lg bg-coupang-blue py-4 text-lg font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                {formatPrice(finalTotal)}원 결제하기
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                위 주문 내용을 확인하였으며, 결제에 동의합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
