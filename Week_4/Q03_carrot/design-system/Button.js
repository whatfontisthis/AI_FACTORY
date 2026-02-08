// Design System - Button 컴포넌트
// 터치 친화적인 버튼 (최소 44x44px 터치 영역)

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  fullWidth = false,
  icon,
  className = ''
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-orange-500 text-white active:bg-orange-600',
    secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300',
    outline: 'border-2 border-orange-500 text-orange-500 active:bg-orange-50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 active:bg-gray-200',
    danger: 'bg-red-500 text-white active:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-base min-h-[44px]',
    lg: 'px-6 py-3.5 text-lg min-h-[52px]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
