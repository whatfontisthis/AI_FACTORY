// Design System - Avatar 컴포넌트
// 프로필 이미지 표시

function Avatar({
  src,
  alt = 'User',
  size = 'md',
  className = ''
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <i className="fas fa-user"></i>
        </div>
      )}
    </div>
  );
}
