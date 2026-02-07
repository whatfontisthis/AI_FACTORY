import type { Product } from '@/types';

export function mapRawProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: (raw.description as string) || '',
    price: raw.price as number,
    discountPrice: raw.discount_price as number | undefined,
    imageUrl: raw.image_url as string,
    images: (raw.images as string[]) || [],
    categoryId: raw.category_id as string,
    rating: raw.rating as number,
    reviewCount: raw.review_count as number,
    isRocketDelivery: raw.is_rocket_delivery as boolean,
    stock: raw.stock as number,
    options: raw.options as Product['options'],
    createdAt: raw.created_at as string,
  };
}
