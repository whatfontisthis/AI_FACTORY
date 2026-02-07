import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { mapRawProduct } from '@/lib/mappers';

interface RawProductsResponse {
  products: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}

export interface UseProductsOptions {
  categoryId?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  rocketOnly?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { categoryId, search, sort, page = 1, limit = 20, minPrice, maxPrice, minRating, rocketOnly } = options;

  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.set('category', categoryId);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (minPrice != null) params.set('min_price', String(minPrice));
      if (maxPrice != null) params.set('max_price', String(maxPrice));
      if (minRating != null) params.set('min_rating', String(minRating));
      if (rocketOnly) params.set('rocket_only', 'true');
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await api.get<RawProductsResponse>(`/products?${params}`);
      return {
        ...res.data,
        products: res.data.products.map(mapRawProduct),
      };
    },
  });
}
