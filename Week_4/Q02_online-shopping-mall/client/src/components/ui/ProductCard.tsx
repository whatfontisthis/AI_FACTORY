import { Link } from 'react-router-dom';
import { formatPrice, getDiscountRate } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice! : product.price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {product.isRocketDelivery && (
          <span className="absolute left-2 top-2 rounded bg-coupang-rocket px-2 py-0.5 text-xs font-bold text-white">
            로켓배송
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 line-clamp-2 text-sm text-gray-800 group-hover:text-coupang-blue">
          {product.name}
        </h3>

        <div className="mt-2">
          {hasDiscount && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-coupang-red">
                {getDiscountRate(product.price, product.discountPrice!)}%
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}원
              </span>
            </div>
          )}
          <p className="text-lg font-bold text-gray-900">
            {formatPrice(displayPrice)}
            <span className="text-sm font-normal">원</span>
          </p>
        </div>

        <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500">
          <span className="text-yellow-400">★</span>
          <span>{product.rating}</span>
          <span>({formatPrice(product.reviewCount)})</span>
        </div>

        {product.isRocketDelivery && (
          <p className="mt-1.5 text-xs font-medium text-coupang-rocket">
            로켓배송 · 내일 도착
          </p>
        )}
      </div>
    </Link>
  );
}
