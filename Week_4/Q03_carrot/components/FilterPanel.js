// FilterPanel 컴포넌트
// 모바일 친화적인 하단 슬라이드업 필터 패널

function FilterPanel({ isOpen, onClose, filters, onApply }) {
  const { useState, useEffect } = React;

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'digital', label: '디지털기기' },
    { value: 'appliances', label: '생활가전' },
    { value: 'furniture', label: '가구/인테리어' },
    { value: 'kids', label: '유아동' },
    { value: 'fashion', label: '의류' },
    { value: 'beauty', label: '뷰티/미용' },
    { value: 'sports', label: '스포츠/레저' },
    { value: 'hobby', label: '취미/게임' },
    { value: 'books', label: '도서' },
    { value: 'pets', label: '반려동물용품' },
    { value: 'etc', label: '기타' }
  ];

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
    { value: 'price_low', label: '낮은 가격순' },
    { value: 'price_high', label: '높은 가격순' }
  ];

  const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all');
  const [minPrice, setMinPrice] = useState(filters?.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters?.maxPrice || '');
  const [location, setLocation] = useState(filters?.location || '');
  const [sortBy, setSortBy] = useState(filters?.sortBy || 'latest');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      location: location || undefined,
      sortBy
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSortBy('latest');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* 필터 패널 (하단에서 슬라이드업) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold">필터</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* 카테고리 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-700">카테고리</h4>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 가격대 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-700">가격</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="최소 가격"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="최대 가격"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {/* 빠른 가격 선택 */}
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: '1만원 이하', max: 10000 },
                { label: '5만원 이하', max: 50000 },
                { label: '10만원 이하', max: 100000 },
                { label: '50만원 이하', max: 500000 }
              ].map(range => (
                <button
                  key={range.label}
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice(range.max.toString());
                  }}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* 지역 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-700">지역</h4>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 강남구, 서초동"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* 정렬 */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-gray-700">정렬</h4>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            적용하기
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
