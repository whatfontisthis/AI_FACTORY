import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ui/ProductCard';

interface ProductGridProps {
  title: string;
  categoryId?: string;
  limit?: number;
}

export function ProductGrid({ title, categoryId, limit = 8 }: ProductGridProps) {
  const { data, isLoading, error } = useProducts({ categoryId, limit });

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">상품을 불러오는데 실패했습니다.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-100 bg-white">
              <div className="aspect-square bg-gray-200" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-5 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
