import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatPrice, getDiscountRate } from '@/lib/utils';
import { mapRawProduct } from '@/lib/mappers';
import { Header } from '@/components/ui/Header';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showCartConfirm, setShowCartConfirm] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get<{ product: Record<string, unknown> }>(`/products/${id}`);
      return mapRawProduct(res.data.product);
    },
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!product) return;
    await addToCart.mutateAsync({
      productId: product.id,
      quantity,
      selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
    });
    setShowCartConfirm(true);
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    if (!product) return;
    await addToCart.mutateAsync({
      productId: product.id,
      quantity,
      selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
    });
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid animate-pulse gap-8 md:grid-cols-2">
            <div className="aspect-square rounded-lg bg-gray-200" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-6 w-1/2 rounded bg-gray-200" />
              <div className="h-12 w-1/3 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg text-gray-500">상품을 찾을 수 없습니다</p>
          <button onClick={() => navigate('/')} className="mt-4 rounded-md bg-coupang-blue px-6 py-2 text-white">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;
  const discountRate = hasDiscount ? getDiscountRate(product.price, product.discountPrice!) : 0;
  const allImages = [product.imageUrl, ...product.images];

  // Parse options from JSONB
  const productOptions: { name: string; values: string[] }[] = Array.isArray(product.options) ? product.options : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <ConfirmModal
        open={showCartConfirm}
        title="장바구니에 담았습니다"
        message="장바구니로 이동하시겠습니까?"
        confirmText="장바구니로 이동"
        cancelText="계속 쇼핑하기"
        onConfirm={() => { setShowCartConfirm(false); navigate('/cart'); }}
        onCancel={() => setShowCartConfirm(false)}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Image Gallery */}
          <div>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="mt-3 flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-md border-2 ${
                      selectedImage === i ? 'border-coupang-blue' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.isRocketDelivery && (
              <span className="mb-2 inline-block rounded bg-coupang-rocket px-3 py-1 text-xs font-bold text-white">
                로켓배송
              </span>
            )}

            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{product.name}</h1>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{i < Math.round(product.rating) ? '★' : '☆'}</span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviewCount.toLocaleString()}개 리뷰)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
              {hasDiscount && (
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-coupang-red">{discountRate}%</span>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}원</span>
                </div>
              )}
              <p className="text-3xl font-extrabold text-gray-900">
                {formatPrice(displayPrice)}<span className="text-lg font-normal">원</span>
              </p>
              {product.isRocketDelivery && (
                <p className="mt-2 text-sm font-medium text-coupang-rocket">로켓배송 · 내일 새벽 도착 보장</p>
              )}
            </div>

            {/* Options */}
            {productOptions.length > 0 && (
              <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-gray-700">옵션 선택</h3>
                {productOptions.map((option) => (
                  <div key={option.name} className="mb-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500">{option.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))}
                          className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                            selectedOptions[option.name] === value
                              ? 'border-coupang-blue bg-blue-50 text-coupang-blue'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-gray-700">상품 설명</h3>
                <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-gray-700">수량</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-lg hover:bg-gray-50"
                >-</button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-lg hover:bg-gray-50"
                >+</button>
                <span className="ml-2 text-sm text-gray-400">(재고: {product.stock}개)</span>
              </div>
              <p className="mt-3 text-right text-lg font-bold text-gray-900">
                총 금액: {formatPrice(displayPrice * quantity)}원
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex-1 rounded-lg border-2 border-coupang-blue py-4 text-lg font-bold text-coupang-blue transition-colors hover:bg-blue-50 disabled:opacity-50"
              >장바구니 담기</button>
              <button
                onClick={handleBuyNow}
                disabled={addToCart.isPending}
                className="flex-1 rounded-lg bg-coupang-blue py-4 text-lg font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >바로 구매</button>
            </div>

            {product.stock < 10 && product.stock > 0 && (
              <p className="mt-3 text-center text-sm font-medium text-coupang-red">
                남은 수량 {product.stock}개! 서두르세요!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
