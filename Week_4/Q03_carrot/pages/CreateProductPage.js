// CreateProductPage.js - 상품 등록 페이지
function CreateProductPage() {
  const { navigate } = window.useRouter();
  const { userProfile, isAuthenticated, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showLocationModal, setShowLocationModal] = React.useState(false);

  // 폼 상태
  const [formData, setFormData] = React.useState({
    images: [],
    title: '',
    category: '',
    price: '',
    description: '',
    location: userProfile?.address || '동네를 설정해주세요',
  });

  // Update location when userProfile changes
  React.useEffect(() => {
    if (userProfile?.address && formData.location === '동네를 설정해주세요') {
      setFormData(prev => ({ ...prev, location: userProfile.address }));
    }
  }, [userProfile?.address]);

  // 에러 상태
  const [errors, setErrors] = React.useState({});

  // 카테고리 옵션
  const categories = [
    { value: 'digital', label: '디지털기기' },
    { value: 'appliances', label: '생활가전' },
    { value: 'furniture', label: '가구/인테리어' },
    { value: 'kids', label: '유아동' },
    { value: 'fashion', label: '패션/의류' },
    { value: 'beauty', label: '뷰티/미용' },
    { value: 'sports', label: '스포츠/레저' },
    { value: 'hobby', label: '취미/게임/음반' },
    { value: 'books', label: '도서' },
    { value: 'food', label: '식품' },
    { value: 'pet', label: '반려동물용품' },
    { value: 'plant', label: '식물' },
    { value: 'other', label: '기타 중고물품' },
  ];

  // 입력 핸들러
  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
    // 에러 제거
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  // 이미지 변경 핸들러
  const handleImagesChange = (images) => {
    setFormData({
      ...formData,
      images
    });
    if (errors.images) {
      setErrors({
        ...errors,
        images: ''
      });
    }
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};

    if (formData.images.length === 0) {
      newErrors.images = '최소 1장의 사진을 등록해주세요.';
    }

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length < 2) {
      newErrors.title = '제목은 2자 이상 입력해주세요.';
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!formData.price) {
      newErrors.price = '가격을 입력해주세요.';
    } else if (parseInt(formData.price) < 0) {
      newErrors.price = '올바른 가격을 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '상품 설명을 입력해주세요.';
    } else if (formData.description.length < 10) {
      newErrors.description = '상품 설명을 10자 이상 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // 첫 번째 에러 필드로 스크롤
      const firstError = Object.keys(errors)[0];
      document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Supabase Storage에 이미지 업로드
      const imageUrls = [];

      for (let i = 0; i < formData.images.length; i++) {
        const image = formData.images[i];
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await window.supabase.storage
          .from('product-images')
          .upload(filePath, image.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
        }

        // 공개 URL 생성
        const { data: { publicUrl } } = window.supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // 2. 서버에 상품 정보 전송 (이미지 URL 포함)
      const response = await fetch(`${window.API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          price: formData.price,
          description: formData.description,
          location: formData.location,
          user_id: userProfile?.id,
          image_urls: imageUrls
        })
      });

      if (!response.ok) {
        throw new Error('상품 등록에 실패했습니다.');
      }

      const result = await response.json();

      // 성공 시 홈으로 이동
      alert('상품이 등록되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('상품 등록 오류:', error);
      alert(error.message || '상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-lg font-semibold">상품 등록</h1>
            <div className="w-10"></div>
          </div>
        </header>
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <i className="fas fa-camera text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 text-center mb-6">
            상품을 등록하려면 로그인해주세요.
          </p>
          <Button variant="primary" onClick={() => navigate('/my')}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">상품 등록</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* 이미지 업로드 */}
        <div id="images">
          <h2 className="text-base font-semibold mb-3">상품 이미지</h2>
          <ImageUpload
            images={formData.images}
            onChange={handleImagesChange}
            maxImages={10}
          />
          {errors.images && (
            <p className="mt-2 text-sm text-red-500">{errors.images}</p>
          )}
        </div>

        {/* 제목 */}
        <div id="title">
          <Input
            label="제목"
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="상품 제목을 입력하세요"
            error={errors.title}
            maxLength={50}
          />
        </div>

        {/* 카테고리 */}
        <div id="category">
          <Select
            label="카테고리"
            value={formData.category}
            onChange={handleChange('category')}
            options={categories}
            placeholder="카테고리를 선택하세요"
            error={errors.category}
          />
        </div>

        {/* 가격 */}
        <div id="price">
          <PriceInput
            label="가격"
            value={formData.price}
            onChange={handleChange('price')}
            placeholder="가격을 입력하세요"
            error={errors.price}
          />
        </div>

        {/* 상세 설명 */}
        <div id="description">
          <Textarea
            label="상세 설명"
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="상품에 대한 설명을 자세히 입력해주세요.&#10;&#10;- 브랜드/모델명&#10;- 구매 시기&#10;- 사용감&#10;- 하자 유무"
            error={errors.description}
            rows={8}
            maxLength={1000}
          />
        </div>

        {/* 거래 위치 */}
        <div id="location">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <i className="fas fa-map-marker-alt text-orange-500"></i>
              <div>
                <p className="text-sm font-medium">{formData.location}</p>
                <p className="text-xs text-gray-500">거래 희망 장소</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100"
            >
              변경
            </button>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                <span>등록 중...</span>
              </div>
            ) : (
              '작성 완료'
            )}
          </Button>
        </div>
      </form>

      {/* 동네 설정 모달 */}
      <LocationSettingModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={formData.location}
        onSave={async (location) => {
          setFormData(prev => ({ ...prev, location }));
          // Also update user profile if authenticated
          if (isAuthenticated && updateProfile) {
            try {
              await updateProfile({ address: location });
            } catch (err) {
              console.error('Failed to update profile location:', err);
            }
          }
          setShowLocationModal(false);
        }}
      />
    </div>
  );
}
