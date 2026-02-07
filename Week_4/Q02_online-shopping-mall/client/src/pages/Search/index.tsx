import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/ui/Header';
import { ProductCard } from '@/components/ui/ProductCard';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const SORT_OPTIONS = [
  { value: '', label: '추천순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
  { value: 'rating', label: '평점순' },
] as const;

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;

  const [sort, setSort] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [rocketOnly, setRocketOnly] = useState(false);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts({
    search: query,
    categoryId: category,
    sort,
    limit: 20,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minRating,
    rocketOnly,
  });

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersectionObserver(loadMore, !!hasNextPage);

  const allProducts = data?.pages.flatMap((p) => p.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {query && (
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            &lsquo;{query}&rsquo; 검색 결과
            {total > 0 && <span className="ml-2 text-sm font-normal text-gray-500">({total.toLocaleString()}개)</span>}
          </h2>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900">필터</h3>

              {/* Rocket Delivery */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rocketOnly}
                  onChange={(e) => setRocketOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-coupang-rocket"
                />
                <span className="text-sm font-medium text-coupang-rocket">로켓배송만</span>
              </label>

              {/* Price Range */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">가격 범위</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="최소"
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                  />
                  <span className="text-gray-400">~</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="최대"
                    className="w-full rounded-md border px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">평점</label>
                <div className="space-y-1">
                  {[4, 3, 2].map((rating) => (
                    <label key={rating} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-sm text-yellow-400">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
                      <span className="text-xs text-gray-400">{rating}점 이상</span>
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === undefined}
                      onChange={() => setMinRating(undefined)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs text-gray-400">전체</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Sort bar */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSort(option.value)}
                    className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                      sort === option.value
                        ? 'bg-coupang-blue text-white'
                        : 'border border-gray-200 text-gray-600 hover:border-coupang-blue hover:text-coupang-blue'
                    }`}
                  >{option.label}</button>
                ))}
              </div>
              {total > 0 && <span className="text-sm text-gray-400">{total.toLocaleString()}개의 상품</span>}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border border-gray-100 bg-white">
                    <div className="aspect-square bg-gray-200" />
                    <div className="space-y-2 p-3">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-5 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium">검색 결과가 없습니다</p>
                <p className="mt-1 text-sm">다른 검색어나 필터를 시도해보세요</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {allProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="mt-8 flex justify-center py-4">
                  {isFetchingNextPage && (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-coupang-blue border-t-transparent" />
                  )}
                  {!hasNextPage && allProducts.length > 0 && (
                    <p className="text-sm text-gray-400">모든 상품을 불러왔습니다</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
