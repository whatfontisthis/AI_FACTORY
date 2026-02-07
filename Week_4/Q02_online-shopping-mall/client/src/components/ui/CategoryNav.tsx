import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';

interface RawCategory {
  id: string;
  name: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
}

export function CategoryNav() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<{ categories: RawCategory[] }>('/categories');
      return res.data.categories;
    },
  });

  const handleCategoryClick = (categoryId?: string) => {
    if (categoryId) {
      navigate(`/search?category=${categoryId}`);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2">
        <button
          onClick={() => handleCategoryClick()}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-coupang-blue text-white'
              : 'border border-gray-200 text-gray-700 hover:border-coupang-blue hover:text-coupang-blue'
          }`}
        >
          전체
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
              activeCategory === category.id
                ? 'bg-coupang-blue text-white'
                : 'border border-gray-200 text-gray-700 hover:border-coupang-blue hover:text-coupang-blue'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
