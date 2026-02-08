// SearchBar 컴포넌트
// 상단 고정 검색바 + 필터 버튼 (모바일 최적화)

function SearchBar({
  value,
  onChange,
  onSearch,
  onFilterClick,
  placeholder = '동네 이름, 물건 이름 등을 검색해보세요!',
  hasActiveFilters = false
}) {
  const { useState } = React;
  const [inputValue, setInputValue] = useState(value || '');

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (onChange) onChange({ target: { value: '' } });
    if (onSearch) onSearch('');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        {/* 검색 입력 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 필터 버튼 */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className={`relative p-2.5 rounded-lg border transition-all ${
              hasActiveFilters
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                !
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
