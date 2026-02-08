// ProductDetailPage 컴포넌트
// 상품 상세 페이지 - 이미지 캐러셀, 상세 정보, 판매자 정보 포함

function ProductDetailPage() {
  const { useParams, useRouter } = window;
  const { id } = useParams();
  const { navigate } = useRouter();
  const { useState, useEffect, useRef } = React;
  const { userProfile, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const scrollRef = useRef(null);

  // Listen for hash changes to handle navigation between products
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Temperature-based comment function
  const getTemperatureComment = (temp) => {
    if (temp >= 60) return '🔥 최고의 거래 파트너!';
    if (temp >= 50) return '😍 정말 좋은 분이에요';
    if (temp >= 45) return '😊 믿을 수 있어요';
    if (temp >= 40) return '🙂 친절해요';
    if (temp >= 37) return '👋 첫 거래를 시작해요';
    return '🌱 새로운 이웃이에요';
  };

  // 상품 정보 로드
  useEffect(() => {
    // Get product ID directly from URL hash to ensure it's current
    const hashPath = window.location.hash.replace('#', '');
    const match = hashPath.match(/\/product\/(\d+)/);
    const productId = match ? match[1] : id;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${window.API_BASE_URL}/api/products/${productId}`);
        const data = await response.json();

        if (data.success) {
          const productData = data.data;

          // Transform images array
          let images = [];
          if (productData.images && Array.isArray(productData.images)) {
            images = productData.images.map(img =>
              img.startsWith('http') ? img : `${window.API_BASE_URL}${img}`
            );
          }
          if (images.length === 0) {
            images = [`https://picsum.photos/seed/${id}/600/600`];
          }

          setProduct({
            ...productData,
            images,
            likeCount: productData.like_count || 0,
            chatCount: productData.chat_count || 0,
            viewCount: productData.view_count || 0,
            createdAt: productData.created_at
          });

          // Set seller info from API response
          if (productData.seller) {
            setSeller({
              id: productData.seller.id,
              name: productData.seller.nickname || '판매자',
              profileImage: productData.seller.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(productData.seller.nickname || 'User')}&background=ff6f00&color=fff`,
              mannerTemp: parseFloat(productData.seller.manner_temp) || 36.5,
              address: productData.seller.address
            });
          } else {
            setSeller({
              name: '판매자',
              profileImage: `https://ui-avatars.com/api/?name=User&background=ff6f00&color=fff`,
              mannerTemp: 36.5
            });
          }

          // Check if user has favorited this product
          if (isAuthenticated && userProfile?.id) {
            try {
              const favResponse = await fetch(
                `${window.API_BASE_URL}/api/favorites/check/${userProfile.id}/${productId}`
              );
              const favData = await favResponse.json();
              if (favData.success) {
                setIsLiked(favData.isFavorited);
              }
            } catch (err) {
              console.error('Error checking favorite status:', err);
            }
          }
        } else {
          setError('상품을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [id, isAuthenticated, userProfile?.id, currentHash]);

  // 관심 등록/취소
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/my');
      return;
    }

    try {
      if (isLiked) {
        // 관심 취소
        await fetch(`${window.API_BASE_URL}/api/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userProfile.id,
            product_id: parseInt(id)
          })
        });
      } else {
        // 관심 등록
        await fetch(`${window.API_BASE_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userProfile.id,
            product_id: parseInt(id)
          })
        });
      }
      setIsLiked(!isLiked);
      setProduct(prev => ({
        ...prev,
        likeCount: isLiked ? prev.likeCount - 1 : prev.likeCount + 1
      }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('관심 등록에 실패했습니다.');
    }
  };

  // 이미지 스크롤 이벤트 핸들러
  const handleImageScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const imageWidth = scrollRef.current.offsetWidth;
      const index = Math.round(scrollLeft / imageWidth);
      setCurrentImageIndex(index);
    }
  };

  // 이미지 인덱스로 스크롤
  const scrollToImage = (index) => {
    if (scrollRef.current) {
      const imageWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: imageWidth * index,
        behavior: 'smooth'
      });
      setCurrentImageIndex(index);
    }
  };

  // 공유하기 핸들러
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `${product.price.toLocaleString('ko-KR')}원 - ${product.location}`,
        url: window.location.href
      });
    } else {
      alert('공유 기능이 지원되지 않는 브라우저입니다.');
    }
  };

  // 채팅하기 핸들러
  const handleChat = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/my');
      return;
    }

    // 본인 상품인 경우
    if (product.user_id === userProfile.id) {
      alert('본인 상품에는 채팅할 수 없습니다.');
      return;
    }

    try {
      // 채팅방 생성 또는 기존 채팅방 가져오기
      const response = await fetch(`${window.API_BASE_URL}/api/chat/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1_id: userProfile.id,
          user2_id: product.user_id,
          product_id: parseInt(id)
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/chat/${data.data.id}`);
      } else {
        alert('채팅방을 생성할 수 없습니다.');
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('채팅 연결에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spinner size="lg" color="orange" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <i className="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-500 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-700 active:opacity-70 transition-opacity"
          aria-label="뒤로가기"
        >
          <i className="fas fa-arrow-left text-2xl"></i>
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={handleShare}
            className="text-gray-700 active:opacity-70 transition-opacity"
            aria-label="공유하기"
          >
            <i className="fas fa-share-alt text-2xl"></i>
          </button>
          <button
            className="text-gray-700 active:opacity-70 transition-opacity"
            aria-label="더보기"
          >
            <i className="fas fa-ellipsis-v text-2xl"></i>
          </button>
        </div>
      </div>

      {/* 이미지 캐러셀 */}
      <div className="relative bg-black">
        {/* 이미지 슬라이더 */}
        <div
          ref={scrollRef}
          onScroll={handleImageScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {product.images.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full aspect-square snap-center"
            >
              <img
                src={image}
                alt={`${product.title} - 이미지 ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/seed/${id}${index}/600/600`;
                }}
              />
            </div>
          ))}
        </div>

        {/* 이미지 인디케이터 */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
          {currentImageIndex + 1} / {product.images.length}
        </div>

        {/* 이미지 도트 인디케이터 */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? 'bg-white w-6'
                    : 'bg-white bg-opacity-50'
                }`}
                aria-label={`이미지 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 판매자 정보 */}
      {seller && (
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={seller.profileImage} size="lg" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{seller.name}</h3>
              <p className="text-sm text-gray-500">{product.location}</p>
              <p className="text-xs text-gray-400 mt-1">{getTemperatureComment(seller.mannerTemp)}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">매너온도</div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-orange-600">
                  {seller.mannerTemp}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상품 정보 */}
      <div className="border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h1>

        {/* 카테고리 및 등록일 */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>{product.category}</span>
          <span>•</span>
          <span>
            {new Date(product.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* 상품 설명 */}
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
          {product.description}
        </p>

        {/* 조회/채팅/관심 통계 */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <i className="far fa-comment-dots"></i>
            <span>채팅 {product.chatCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="far fa-heart"></i>
            <span>관심 {product.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="far fa-eye"></i>
            <span>조회 {product.viewCount}</span>
          </div>
        </div>
      </div>

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-20 shadow-lg">
        {/* 관심 버튼 */}
        <button
          onClick={handleToggleLike}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center active:scale-95 transition-transform"
          aria-label={isLiked ? '관심 취소' : '관심 등록'}
        >
          <i
            className={`${isLiked ? 'fas' : 'far'} fa-heart text-2xl transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400'
            }`}
          ></i>
        </button>

        {/* 가격 및 채팅 버튼 */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-0.5">가격</div>
            <div className="text-xl font-bold text-gray-900">
              {product.price === 0 ? '나눔' : `${product.price.toLocaleString('ko-KR')}원`}
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleChat}
            className="flex-shrink-0 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg active:scale-95 transition-transform"
          >
            채팅하기
          </Button>
        </div>
      </div>
    </div>
  );
}
