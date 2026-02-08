// BottomNav 컴포넌트
// 하단 네비게이션 바

function BottomNav({ currentPath, onNavigate }) {
  const navItems = [
    { path: '/', icon: 'fas fa-home', label: '홈' },
    { path: '/favorites', icon: 'far fa-heart', label: '관심목록' },
    { path: '/chat', icon: 'far fa-comment-dots', label: '채팅' },
    { path: '/my', icon: 'far fa-user', label: '나의 당근' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`
              flex flex-col items-center justify-center flex-1 h-full
              transition-colors active:bg-gray-50
              ${currentPath === item.path ? 'text-orange-500' : 'text-gray-500'}
            `}
          >
            <i className={`${item.icon} text-2xl mb-1 ${currentPath === item.path && item.path === '/favorites' ? 'fas' : ''}`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
