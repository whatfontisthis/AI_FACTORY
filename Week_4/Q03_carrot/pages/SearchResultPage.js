// SearchResultPage 컴포넌트
// 검색 결과 표시 + 필터링 기능

function SearchResultPage() {
  const { useState, useEffect, useCallback } = React;
  const { navigate } = useRouter();
  const params = useParams();

  // 상태 관리
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: undefined,
    maxPrice: undefined,
    location: undefined,
    sortBy: 'latest'
  });

  // 페이지네이션
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 12
  });

  // URL에서 쿼리 파라미터 읽기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const search = urlParams.get('search') || '';
    const category = urlParams.get('category') || 'all';
    const minPrice = urlParams.get('minPrice');
    const maxPrice = urlParams.get('maxPrice');
    const location = urlParams.get('location');
    const sortBy = urlParams.get('sortBy') || 'latest';

    setFilters({
      search,
      category,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      location,
      sortBy
    });
  }, []);

  // 상품 검색/필터링 API 호출
  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', pagination.limit);

      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice);
      if (filters.location) params.append('location', filters.location);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`${window.API_BASE_URL}/api/products?${params}`);

      if (!response.ok) {
        throw new Error('상품 검색에 실패했습니다.');
      }

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
        setPagination(result.pagination);
        updateURL(); // URL 업데이트
      } else {
        throw new Error(result.error || '상품을 불러올 수 없습니다.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // URL 업데이트 (브라우저 히스토리)
  const updateURL = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category && filters.category !== 'all') params.set('category', filters.category);
    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice);
    if (filters.location) params.set('location', filters.location);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);

    const newURL = `/search${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', `#${newURL}`);
  };

  // 필터 변경 시 상품 재조회
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // 검색어 변경
  const handleSearchChange = (keyword) => {
    setFilters(prev => ({ ...prev, search: keyword }));
  };

  // 필터 적용
  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 활성화된 필터 개수 확인
  const hasActiveFilters = () => {
    return (
      (filters.category && filters.category !== 'all') ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.location ||
      (filters.sortBy && filters.sortBy !== 'latest')
    );
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      search: filters.search, // 검색어는 유지
      category: 'all',
      minPrice: undefined,
      maxPrice: undefined,
      location: undefined,
      sortBy: 'latest'
    });
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    return price.toLocaleString('ko-KR') + '원';
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // 초 단위

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* SearchBar */}
      <SearchBar
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        onSearch={handleSearchChange}
        onFilterClick={() => setIsFilterOpen(true)}
        hasActiveFilters={hasActiveFilters()}
        placeholder="검색어를 입력하세요"
      />

      {/* 활성화된 필터 표시 */}
      {hasActiveFilters() && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">적용된 필터</span>
            <button
              onClick={handleResetFilters}
              className="text-sm text-orange-500 hover:text-orange-600"
            >
              초기화
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== 'all' && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {filters.category}
              </span>
            )}
            {filters.minPrice !== undefined && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {formatPrice(filters.minPrice)} 이상
              </span>
            )}
            {filters.maxPrice !== undefined && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {formatPrice(filters.maxPrice)} 이하
              </span>
            )}
            {filters.location && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                📍 {filters.location}
              </span>
            )}
            {filters.sortBy && filters.sortBy !== 'latest' && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {filters.sortBy === 'popular' ? '인기순' : filters.sortBy === 'price_low' ? '낮은 가격순' : '높은 가격순'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 검색 결과 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <p className="text-sm text-gray-600">
          {loading ? (
            '검색 중...'
          ) : (
            <>
              전체 <span className="text-orange-500 font-semibold">{pagination.totalProducts}</span>개
              {filters.search && (
                <> · &quot;<span className="font-medium">{filters.search}</span>&quot;</>
              )}
            </>
          )}
        </p>
      </div>

      {/* 상품 목록 */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchProducts(1)} variant="primary">
              다시 시도
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 mb-2">검색 결과가 없습니다</p>
            <p className="text-sm text-gray-400">다른 검색어나 필터를 시도해보세요</p>
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {products.map(product => (
                <Card
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* 상품 이미지 */}
                  <div className="relative pb-[100%] bg-gray-200 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={`${window.API_BASE_URL}${product.images[0]}`}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        이미지 없음
                      </div>
                    )}
                    {/* 상태 배지 */}
                    {product.status === 'reserved' && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="warning">예약중</Badge>
                      </div>
                    )}
                    {product.status === 'sold' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <Badge variant="secondary" size="lg">판매완료</Badge>
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    <p className="text-base font-bold text-gray-900 mb-2">
                      {formatPrice(product.price)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{product.location}</span>
                      <span>{formatTime(product.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>❤️ {product.like_count}</span>
                      <span>💬 {product.chat_count}</span>
                      <span>👁️ {product.view_count}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="ghost"
                  size="sm"
                >
                  이전
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg font-medium text-sm ${
                          pagination.currentPage === pageNum
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="ghost"
                  size="sm"
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FilterPanel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
