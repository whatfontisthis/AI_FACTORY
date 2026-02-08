// FeedPage 컴포넌트
// 메인 피드 화면 (무한 스크롤, 카테고리 필터)

function FeedPage() {
  const { useState, useEffect, useRef, useCallback } = React;
  const { userProfile, isAuthenticated, updateProfile } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Get user's location for filtering (extract region like "서울" or "경기")
  const userLocation = userProfile?.address || null;
  const locationFilter = userLocation ? userLocation.split(' ')[0] : null; // "서울 강남구" -> "서울"

  const observer = useRef();
  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // 카테고리 목록
  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'digital', name: '디지털기기', icon: '💻' },
    { id: 'furniture', name: '가구/인테리어', icon: '🛋️' },
    { id: 'kids', name: '유아동', icon: '👶' },
    { id: 'fashion', name: '패션/의류', icon: '👗' },
    { id: 'beauty', name: '뷰티/미용', icon: '💄' },
    { id: 'sports', name: '스포츠/레저', icon: '⚽' },
    { id: 'books', name: '도서', icon: '📚' },
    { id: 'hobby', name: '취미/게임', icon: '🎮' },
    { id: 'etc', name: '기타', icon: '📦' },
  ];

  // 상품 로드 - 실제 API 호출
  const loadProducts = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: 'active'
      });

      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      // Auto-filter by user's location (region level: 서울, 경기)
      if (locationFilter) {
        params.append('location', locationFilter);
      }

      // Price filters
      if (minPrice) {
        params.append('min_price', minPrice.toString());
      }
      if (maxPrice) {
        params.append('max_price', maxPrice.toString());
      }

      // Sort order
      if (sortBy && sortBy !== 'latest') {
        params.append('sort', sortBy);
      }

      const response = await fetch(`${window.API_BASE_URL}/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        // Transform API data to match component expectations
        const transformedProducts = data.data.map(product => ({
          ...product,
          image: product.images && product.images.length > 0
            ? (product.images[0].startsWith('http') ? product.images[0] : `${window.API_BASE_URL}${product.images[0]}`)
            : `https://picsum.photos/seed/${product.id}/300/300`,
          likeCount: product.like_count || 0,
          chatCount: product.chat_count || 0,
          createdAt: product.created_at
        }));

        if (page === 1) {
          setProducts(transformedProducts);
        } else {
          setProducts(prev => [...prev, ...transformedProducts]);
        }

        setHasMore(data.pagination.currentPage < data.pagination.totalPages);
      } else {
        console.error('Failed to load products:', data.error);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery, loading, locationFilter, minPrice, maxPrice, sortBy]);

  // Reload when location changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
  }, [locationFilter]);

  useEffect(() => {
    loadProducts();
  }, [page, activeCategory, locationFilter, minPrice, maxPrice, sortBy]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !userProfile?.id) return;

      try {
        const response = await fetch(
          `${window.API_BASE_URL}/api/notifications/unread/${userProfile.id}`
        );
        const data = await response.json();
        if (data.success) {
          setUnreadNotifications(data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, userProfile?.id]);

  // 검색 핸들러
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // 검색 실행 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        setPage(1);
        setProducts([]);
        loadProducts();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 카테고리 변경
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setPage(1);
    setProducts([]);
  };

  // 상품 클릭
  const handleProductClick = (product) => {
    window.location.hash = `/product/${product.id}`;
  };

  // Handle location save
  const handleSaveLocation = async (location) => {
    try {
      await updateProfile({ address: location });
      setShowLocationModal(false);
      // Products will auto-reload due to locationFilter dependency
    } catch (err) {
      console.error('Failed to save location:', err);
      alert('동네 설정에 실패했습니다.');
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = (filters) => {
    setSearchQuery(filters.query || '');
    setActiveCategory(filters.category || 'all');
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setSortBy(filters.sortBy || 'latest');
    setPage(1);
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 위치 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          {/* 위치 선택 */}
          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center gap-2 text-gray-900 font-medium active:opacity-70"
          >
            <span className="text-base">{userLocation || '동네 설정'}</span>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>

          {/* 우측 아이콘 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="text-gray-700 active:opacity-70"
            >
              <i className="fas fa-sliders-h text-2xl"></i>
            </button>
            <button
              onClick={() => window.location.hash = '/notifications'}
              className="text-gray-700 active:opacity-70 relative"
            >
              <i className="far fa-bell text-2xl"></i>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 검색바 (카테고리 위) */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearch}
      />

      {/* 카테고리 필터 */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* 상품 리스트 */}
      <div className="px-4 py-3 space-y-2">
        {products.length === 0 && !loading ? (
          <div className="text-center py-20 text-gray-500">
            <i className="fas fa-inbox text-4xl mb-4"></i>
            <p className="text-base">상품이 없습니다</p>
            <p className="text-sm mt-2">첫 번째 상품을 등록해보세요!</p>
          </div>
        ) : (
          products.map((product, index) => {
            if (products.length === index + 1) {
              return (
                <div key={product.id} ref={lastProductRef}>
                  <ProductCard product={product} onClick={() => handleProductClick(product)} />
                </div>
              );
            } else {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              );
            }
          })
        )}

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="flex justify-center py-6">
            <Spinner size="md" color="orange" />
          </div>
        )}
      </div>

      {/* 글쓰기 버튼 (플로팅) */}
      <button
        onClick={() => window.location.hash = '/create'}
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-10 hover:bg-orange-600"
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      {/* 동네 설정 모달 */}
      <LocationSettingModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={userLocation}
        onSave={handleSaveLocation}
      />

      {/* 고급 검색 모달 */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        categories={categories}
      />
    </div>
  );
}
