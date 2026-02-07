import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapRawProduct } from '@/lib/mappers';
import type { Product } from '@/types';

interface RawProductsResponse {
  products: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}

export interface UseInfiniteProductsOptions {
  categoryId?: string;
  search?: string;
  sort?: string;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  rocketOnly?: boolean;
}

export function useInfiniteProducts(options: UseInfiniteProductsOptions = {}) {
  const { categoryId, search, sort, limit = 12, minPrice, maxPrice, minRating, rocketOnly } = options;

  return useInfiniteQuery({
    queryKey: ['products-infinite', options],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (categoryId) params.set('category', categoryId);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (minPrice != null) params.set('min_price', String(minPrice));
      if (maxPrice != null) params.set('max_price', String(maxPrice));
      if (minRating != null) params.set('min_rating', String(minRating));
      if (rocketOnly) params.set('rocket_only', 'true');
      params.set('page', String(pageParam));
      params.set('limit', String(limit));

      const res = await api.get<RawProductsResponse>(`/products?${params}`);
      return {
        products: res.data.products.map(mapRawProduct) as Product[],
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
