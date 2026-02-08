// ProductCard 컴포넌트
// 상품 카드 (터치 피드백 포함)

function ProductCard({ product, onClick, showFavoriteButton = false }) {
  // 시간 포맷팅 함수
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 가격 포맷팅
  const formatPrice = (price) => {
    if (!price || price === 0) return '무료 나눔';
    return `${price.toLocaleString('ko-KR')}원`;
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      padding="none"
      className="border border-gray-100 fade-in relative"
    >
      <div className="flex gap-3 p-4">
        {/* 상품 이미지 */}
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <i className="fas fa-image text-2xl"></i>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900 truncate mb-1">
              {product.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
              {product.location} · {formatTimeAgo(product.createdAt)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-base font-bold ${product.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {formatPrice(product.price)}
            </p>

            {/* 채팅/좋아요 카운트 */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {product.chatCount > 0 && (
                <span className="flex items-center gap-1">
                  <i className="far fa-comment-dots"></i>
                  {product.chatCount}
                </span>
              )}
              {product.likeCount > 0 && (
                <span className="flex items-center gap-1">
                  <i className="far fa-heart"></i>
                  {product.likeCount}
                </span>
              )}
            </div>
          </div>

          {/* 상태 배지 */}
          {product.status && product.status !== 'active' && (
            <div className="mt-2">
              {product.status === 'reserved' && (
                <Badge variant="warning" size="sm">예약중</Badge>
              )}
              {product.status === 'sold' && (
                <Badge variant="default" size="sm">거래완료</Badge>
              )}
            </div>
          )}
        </div>

        {/* 찜 버튼 (옵션) */}
        {showFavoriteButton && (
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton
              productId={product.id}
              initialFavorited={product.isFavorited || false}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
