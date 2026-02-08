// ImageUpload.js - 이미지 다중 업로드 컴포넌트
function ImageUpload({ images = [], onChange, maxImages = 10 }) {
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, maxImages - images.length);

    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange([...images, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {/* 업로드 버튼 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 active:bg-gray-200 transition-colors"
          disabled={images.length >= maxImages}
        >
          <i className="fas fa-camera text-2xl text-gray-400 mb-1"></i>
          <span className="text-xs text-gray-500">
            {images.length}/{maxImages}
          </span>
        </button>

        {/* 이미지 미리보기 */}
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={image.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 active:bg-red-700"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
            {index === 0 && (
              <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                대표
              </div>
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        * 첫 번째 사진이 대표 이미지로 설정됩니다.
      </p>
    </div>
  );
}
