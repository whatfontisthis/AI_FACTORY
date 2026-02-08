// 찜 버튼 컴포넌트
function FavoriteButton({ productId, initialFavorited = false, onToggle }) {
  const [isFavorited, setIsFavorited] = React.useState(initialFavorited);
  const [isLoading, setIsLoading] = React.useState(false);
  const { userProfile, isAuthenticated } = useAuth();
  const { navigate } = useRouter();

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/my');
      return;
    }

    if (!userProfile?.id) {
      console.error('User profile not loaded');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // 찜 취소
        const response = await fetch(`${window.API_BASE_URL}/api/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userProfile.id,
            product_id: productId
          })
        });

        if (!response.ok) throw new Error('Failed to remove favorite');

        setIsFavorited(false);
        if (onToggle) onToggle(false);
      } else {
        // 찜하기
        const response = await fetch(`${window.API_BASE_URL}/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userProfile.id,
            product_id: productId
          })
        });

        if (!response.ok) throw new Error('Failed to add favorite');

        setIsFavorited(true);
        if (onToggle) onToggle(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('찜 기능 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`
        p-2 rounded-full transition-all duration-200
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
        ${isFavorited ? 'text-red-500' : 'text-gray-400'}
      `}
      aria-label={isFavorited ? '찜 취소' : '찜하기'}
    >
      <i className={`${isFavorited ? 'fas' : 'far'} fa-heart text-xl`}></i>
    </button>
  );
}
