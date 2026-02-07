export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR');
}

export function getDiscountRate(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}

export const CONFIG = {
  FREE_SHIPPING_THRESHOLD: 19800,
  DELIVERY_FEE: 3000,
} as const;
