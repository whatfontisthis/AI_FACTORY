// MyPage 컴포넌트
// 사용자 프로필, 내 상품, 관심 목록, 설정 메뉴를 포함한 마이페이지

function MyPage() {
  const { navigate } = useRouter();
  const { currentUser, userProfile, loading, signInWithGoogle, signOut, isAuthenticated, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState('selling');
  const [showProfileEdit, setShowProfileEdit] = React.useState(false);
  const [showLocationSetting, setShowLocationSetting] = React.useState(false);
  const [signingIn, setSigningIn] = React.useState(false);

  // 내 상품 목록 상태
  const [mySellingProducts, setMySellingProducts] = React.useState([]);
  const [mySoldProducts, setMySoldProducts] = React.useState([]);
  const [myBoughtProducts, setMyBoughtProducts] = React.useState([]);
  const [favoriteProducts, setFavoriteProducts] = React.useState([]);
  const [productsLoading, setProductsLoading] = React.useState(false);

  // 사용자 상품 가져오기
  React.useEffect(() => {
    const fetchMyProducts = async () => {
      if (!userProfile?.id) return;

      setProductsLoading(true);
      try {
        // 내 상품 가져오기
        const response = await fetch(`${window.API_BASE_URL}/api/products/user/${userProfile.id}`);
        const result = await response.json();

        if (result.success) {
          const products = result.data || [];
          // 상태별로 분류
          setMySellingProducts(products.filter(p => p.status === 'active' || p.status === 'reserved'));
          setMySoldProducts(products.filter(p => p.status === 'sold'));
        }

        // 관심 목록 가져오기
        const favResponse = await fetch(`${window.API_BASE_URL}/api/favorites/${userProfile.id}`);
        const favResult = await favResponse.json();

        if (favResult.success) {
          setFavoriteProducts((favResult.data || []).slice(0, 6)); // 최대 6개만 표시
        }
      } catch (error) {
        console.error('Error fetching my products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchMyProducts();
  }, [userProfile?.id]);

  const getCurrentProducts = () => {
    if (activeTab === 'selling') return mySellingProducts;
    if (activeTab === 'sold') return mySoldProducts;
    return myBoughtProducts;
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await signOut();
      } catch (err) {
        console.error('Sign out failed:', err);
      }
    }
  };

  // 동네 설정 저장
  const handleSaveLocation = async (location) => {
    try {
      await updateProfile({ address: location });
      // Refresh the page to show updated location
      window.location.reload();
    } catch (err) {
      console.error('Failed to save location:', err);
      alert('동네 설정에 실패했습니다.');
    }
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // 로그인되지 않은 경우 로그인 페이지 표시
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <h1 className="text-lg font-bold">나의 당근</h1>
        </div>

        {/* 로그인 유도 */}
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-user text-4xl text-orange-500"></i>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 text-center mb-8">
            당근마켓의 모든 기능을 이용하려면<br />로그인해주세요.
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {signingIn ? (
              <Spinner size="sm" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700 font-medium">Google로 로그인</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-6 text-center">
            로그인 시 당근마켓의 서비스 이용약관 및<br />개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    );
  }

  // 로그인된 경우 프로필 페이지 표시
  const userName = userProfile?.nickname || currentUser?.displayName || '당근유저';
  // Temperature-based comment function
  const getTemperatureComment = (temp) => {
    if (temp >= 60) return '🔥 최고의 거래 파트너!';
    if (temp >= 50) return '😍 정말 좋은 분이에요';
    if (temp >= 45) return '😊 믿을 수 있어요';
    if (temp >= 40) return '🙂 친절해요';
    if (temp >= 37) return '👋 첫 거래를 시작해요';
    return '🌱 새로운 이웃이에요';
  };

  const user = {
    name: userName,
    email: currentUser?.email || '',
    avatar: userProfile?.profile_image_url || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ff6f00&color=fff`,
    location: userProfile?.address || '동네를 설정해주세요',
    bio: userProfile?.bio || '',
    mannerTemp: userProfile?.manner_temp || 36.5,
    totalSales: userProfile?.total_sales || 0,
    totalPurchases: userProfile?.total_purchases || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <h1 className="text-lg font-bold">나의 당근</h1>
      </div>

      {/* 프로필 섹션 */}
      <div className="bg-white p-6 mb-2">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar src={user.avatar} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500">{user.location}</p>
            </div>
          </div>
          <button
            onClick={() => setShowProfileEdit(true)}
            className="text-sm text-orange-500 font-medium"
          >
            프로필 수정
          </button>
        </div>

        {/* 매너온도 */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">매너온도</span>
            <span className="text-lg font-bold text-orange-600">{user.mannerTemp}°C</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((user.mannerTemp / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{getTemperatureComment(user.mannerTemp)}</span>
            <span className="text-gray-500">판매 {user.totalSales} · 구매 {user.totalPurchases}</span>
          </div>
        </div>
      </div>

      {/* 내 상품 탭 */}
      <div className="bg-white mb-2">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('selling')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'selling'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500'
            }`}
          >
            판매중 {mySellingProducts.length}
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'sold'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500'
            }`}
          >
            판매완료 {mySoldProducts.length}
          </button>
          <button
            onClick={() => setActiveTab('buying')}
            className={`flex-1 py-3 text-sm font-medium ${
              activeTab === 'buying'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500'
            }`}
          >
            구매내역 {myBoughtProducts.length}
          </button>
        </div>

        {/* 상품 목록 */}
        <div className="divide-y divide-gray-100">
          {getCurrentProducts().length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <i className="fas fa-box-open text-4xl mb-3"></i>
              <p>아직 상품이 없습니다</p>
            </div>
          ) : (
            getCurrentProducts().map((product) => {
              // 이미지 URL 처리 (JSON 배열 또는 문자열)
              let imageUrl = 'https://picsum.photos/seed/product/100/100';
              if (product.images) {
                const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                if (images.length > 0) {
                  imageUrl = images[0].startsWith('http') ? images[0] : `${window.API_BASE_URL}${images[0]}`;
                }
              }
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="flex gap-3 p-4 active:bg-gray-50 cursor-pointer"
                >
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                      {product.title}
                    </h3>
                    <p className="text-base font-bold text-gray-900 mb-2">
                      {product.price.toLocaleString()}원
                    </p>
                    {product.status === 'reserved' && (
                      <span className="text-xs text-orange-500">예약중</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 관심 목록 미리보기 */}
      <div className="bg-white mb-2 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">관심 목록</h3>
          <button
            onClick={() => navigate('/favorites')}
            className="text-sm text-gray-500"
          >
            전체보기 <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
        {favoriteProducts.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <i className="fas fa-heart text-3xl mb-2"></i>
            <p className="text-sm">관심 상품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {favoriteProducts.map((product) => {
              let imageUrl = 'https://picsum.photos/seed/product/100/100';
              if (product.images) {
                const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                if (images.length > 0) {
                  imageUrl = images[0].startsWith('http') ? images[0] : `${window.API_BASE_URL}${images[0]}`;
                }
              }
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="cursor-pointer"
                >
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full aspect-square rounded-lg object-cover mb-1"
                  />
                  <p className="text-xs text-gray-900 font-medium truncate">
                    {product.title}
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    {product.price.toLocaleString()}원
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 설정 메뉴 */}
      <div className="bg-white divide-y divide-gray-100">
        <button
          onClick={() => setShowLocationSetting(true)}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-map-marker-alt text-gray-600 w-5"></i>
            <span className="text-gray-900">내 동네 설정</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{user.location}</span>
            <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 active:bg-gray-50">
          <div className="flex items-center gap-3">
            <i className="fas fa-bell text-gray-600 w-5"></i>
            <span className="text-gray-900">알림 설정</span>
          </div>
          <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
        </button>
        <button className="w-full flex items-center justify-between p-4 active:bg-gray-50">
          <div className="flex items-center gap-3">
            <i className="fas fa-shield-alt text-gray-600 w-5"></i>
            <span className="text-gray-900">개인정보 보호</span>
          </div>
          <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
        </button>
        <button className="w-full flex items-center justify-between p-4 active:bg-gray-50">
          <div className="flex items-center gap-3">
            <i className="fas fa-question-circle text-gray-600 w-5"></i>
            <span className="text-gray-900">고객센터</span>
          </div>
          <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
        </button>
        <button className="w-full flex items-center justify-between p-4 active:bg-gray-50">
          <div className="flex items-center gap-3">
            <i className="fas fa-cog text-gray-600 w-5"></i>
            <span className="text-gray-900">앱 설정</span>
          </div>
          <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between p-4 active:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-sign-out-alt text-red-500 w-5"></i>
            <span className="text-red-500">로그아웃</span>
          </div>
        </button>
      </div>

      {/* 프로필 수정 모달 */}
      {showProfileEdit && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowProfileEdit(false)}
          onSave={() => setShowProfileEdit(false)}
          onOpenLocationSetting={() => {
            setShowProfileEdit(false);
            setShowLocationSetting(true);
          }}
        />
      )}

      {/* 동네 설정 모달 */}
      <LocationSettingModal
        isOpen={showLocationSetting}
        onClose={() => setShowLocationSetting(false)}
        currentLocation={user.location}
        onSave={handleSaveLocation}
      />
    </div>
  );
}

// 프로필 수정 모달 컴포넌트
function ProfileEditModal({ user, onClose, onSave, onOpenLocationSetting }) {
  const { updateProfile } = useAuth();
  const [formData, setFormData] = React.useState({
    nickname: user.name,
    address: user.location,
    bio: user.bio || '',
  });
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      onSave(formData);
    } catch (err) {
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto fade-in">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="text-gray-600">
            취소
          </button>
          <h2 className="text-lg font-bold">프로필 수정</h2>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-orange-500 font-medium disabled:opacity-50"
          >
            {saving ? '저장 중...' : '완료'}
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center gap-3">
            <Avatar src={user.avatar} size="xl" />
            <button
              type="button"
              className="text-sm text-orange-500 font-medium"
            >
              사진 변경
            </button>
          </div>

          {/* 닉네임 */}
          <Input
            label="닉네임"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            placeholder="닉네임을 입력하세요"
          />

          {/* 소개 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자기소개
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="자신을 소개해주세요"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.bio.length}/200</p>
          </div>

          {/* 지역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내 동네
            </label>
            <button
              type="button"
              onClick={onOpenLocationSetting}
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg active:bg-gray-50"
            >
              <span className="text-gray-900">{formData.address}</span>
              <i className="fas fa-chevron-right text-gray-400 text-sm"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
