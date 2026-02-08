// Design System - Card 컴포넌트
// 터치 피드백이 있는 카드 컨테이너

function Card({
  children,
  onClick,
  hoverable = false,
  padding = 'md',
  className = ''
}) {
  const paddings = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-sm
        ${hoverable ? 'product-card cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
