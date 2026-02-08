// 찜 목록 페이지
function FavoritesPage() {
  const { useState, useEffect } = React;
  const { navigate } = useRouter();
  const { userProfile, isAuthenticated } = useAuth();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, userProfile?.id]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${window.API_BASE_URL}/api/favorites/${userProfile.id}?limit=50`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch favorites');
      }

      setFavorites(data.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await fetch(`${window.API_BASE_URL}/api/favorites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userProfile.id,
          product_id: productId
        })
      });

      setFavorites(prevFavorites =>
        prevFavorites.filter(item => item.id !== productId)
      );
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return '나눔';
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return '방금 전';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}주 전`;
    return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  };

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold">관심 목록</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <i className="far fa-heart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 text-center mb-6">
            관심 목록을 보려면 로그인해주세요.
          </p>
          <Button variant="primary" onClick={() => navigate('/my')}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold">관심 목록</h1>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="orange" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold">관심 목록</h1>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-circle text-4xl"></i>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchFavorites} variant="primary">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold">관심 목록</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <i className="far fa-heart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">관심 목록이 비어있어요</h2>
          <p className="text-gray-500 text-center mb-6">
            마음에 드는 상품을 찜해보세요!
          </p>
          <Button variant="primary" onClick={() => navigate('/')}>
            상품 둘러보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">관심 목록</h1>
          <span className="text-sm text-gray-500">{favorites.length}개</span>
        </div>
      </div>

      {/* 찜 목록 */}
      <div className="divide-y divide-gray-100">
        {favorites.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-white flex gap-4 p-4 active:bg-gray-50 cursor-pointer"
          >
            {/* 상품 이미지 */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={
                  product.images && product.images.length > 0
                    ? (product.images[0].startsWith('http')
                        ? product.images[0]
                        : `${window.API_BASE_URL}${product.images[0]}`)
                    : `https://picsum.photos/seed/${product.id}/200/200`
                }
                alt={product.title}
                className="w-full h-full object-cover rounded-lg"
              />

              {/* 상태 배지 */}
              {product.status === 'sold' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">판매완료</span>
                </div>
              )}
              {product.status === 'reserved' && (
                <div className="absolute top-1 left-1">
                  <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded">예약중</span>
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 mb-1 truncate">
                {product.title}
              </h3>
              <p className="text-lg font-bold text-gray-900 mb-2">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{product.location}</span>
                <span>•</span>
                <span>{formatTimeAgo(product.created_at)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span><i className="far fa-comment"></i> {product.chat_count || 0}</span>
                <span><i className="far fa-heart"></i> {product.like_count || 0}</span>
              </div>
            </div>

            {/* 찜 취소 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFavorite(product.id);
              }}
              className="flex-shrink-0 p-2 text-red-500"
            >
              <i className="fas fa-heart text-xl"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
