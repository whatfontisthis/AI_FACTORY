// Design System - Input 컴포넌트
// 모바일 친화적인 입력 필드

function Input({
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = ''
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-base border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            transition-all
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
          `}
        />
        {rightIcon && (
          <div
            onClick={onRightIconClick}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 ${onRightIconClick ? 'cursor-pointer' : ''}`}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
