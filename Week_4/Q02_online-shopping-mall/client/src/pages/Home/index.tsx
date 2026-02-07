import { useCallback } from 'react';
import { Header } from '@/components/ui/Header';
import { CategoryNav } from '@/components/ui/CategoryNav';
import { Banner } from '@/components/ui/Banner';
import { ProductCard } from '@/components/ui/ProductCard';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export function HomePage() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts({ limit: 12 });

  const loadMore = useCallback(() => {
    if (!isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, isFetchingNextPage]);

  const sentinelRef = useIntersectionObserver(loadMore, !!hasNextPage);

  const allProducts = data?.pages.flatMap((p) => p.products) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryNav />
      <Banner />

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">추천 전자제품</h2>
          {total > 0 && (
            <span className="text-sm text-gray-400">{total}개의 상품</span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
      </section>

      <footer className="border-t bg-white py-8 text-center text-sm text-gray-400">
        &copy; 2026 cellpang — Practice Project
      </footer>
    </div>
  );
}
