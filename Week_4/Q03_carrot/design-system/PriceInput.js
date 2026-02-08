// PriceInput.js - 가격 입력 컴포넌트
function PriceInput({
  label,
  value,
  onChange,
  placeholder = '가격을 입력하세요',
  error,
  disabled = false,
  className = ''
}) {
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    onChange({ target: { value: rawValue } });
  };

  const displayValue = value ? formatNumber(value) : '';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          원
        </span>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
