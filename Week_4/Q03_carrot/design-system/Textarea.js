// Textarea.js - 텍스트 영역 컴포넌트
function Textarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  rows = 4,
  maxLength,
  className = ''
}) {
  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {maxLength && (
            <span className="text-xs text-gray-500">
              {value?.length || 0}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
