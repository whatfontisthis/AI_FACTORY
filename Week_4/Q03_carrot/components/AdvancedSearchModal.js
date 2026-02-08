// AdvancedSearchModal 컴포넌트
// 고급 검색 모달 (중앙 팝업)

function AdvancedSearchModal({ isOpen, onClose, onSearch, categories }) {
  const { useState } = React;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  if (!isOpen) return null;

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      category: selectedCategory,
      minPrice: minPrice ? parseInt(minPrice) : null,
      maxPrice: maxPrice ? parseInt(maxPrice) : null,
      sortBy
    });
    onClose();
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl w-[90%] max-w-md mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">상세 검색</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i className="fas fa-times text-gray-500 text-xl"></i>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* 검색어 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색어</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 가격 범위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">가격 범위</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="최소"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="최대"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'latest', label: '최신순' },
                { id: 'price_asc', label: '가격 낮은순' },
                { id: 'price_desc', label: '가격 높은순' },
                { id: 'popular', label: '인기순' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                    sortBy === option.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={handleReset}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
          <button
            onClick={handleSearch}
            className="flex-1 py-3 px-4 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition-colors"
          >
            검색하기
          </button>
        </div>
      </div>
    </div>
  );
}
