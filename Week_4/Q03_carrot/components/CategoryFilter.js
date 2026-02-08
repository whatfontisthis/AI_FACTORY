// CategoryFilter 컴포넌트
// 가로 스크롤 카테고리 필터

function CategoryFilter({ categories, activeCategory, onCategoryChange }) {
  const { useState } = React;

  return (
    <div className="bg-white border-b border-gray-200 px-2 py-3 sticky top-[73px] z-10">
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
              transition-all active:scale-95
              ${activeCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }
            `}
          >
            {category.icon && <span className="mr-1.5">{category.icon}</span>}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
