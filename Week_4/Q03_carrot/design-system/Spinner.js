// Design System - Spinner 컴포넌트
// 로딩 인디케이터

function Spinner({
  size = 'md',
  color = 'orange',
  className = ''
}) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    orange: 'border-orange-500 border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className={`inline-block rounded-full animate-spin ${sizes[size]} ${colors[color]} ${className}`} />
  );
}
