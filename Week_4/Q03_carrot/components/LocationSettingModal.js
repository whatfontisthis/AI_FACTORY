// LocationSettingModal 컴포넌트
// 동네 설정 모달 - 주요 도시 선택 (지오로케이션 기반, 위치 검증 필수)

function LocationSettingModal({ isOpen, onClose, currentLocation, onSave }) {
  const { useState, useEffect } = React;

  const [selectedCity, setSelectedCity] = useState(currentLocation || '');
  const [detecting, setDetecting] = useState(false);
  const [verifyingCity, setVerifyingCity] = useState(null); // 검증 중인 도시
  const [error, setError] = useState(null);

  // 주요 도시 목록 (7대 광역시) - 반경 약 50km 허용
  const cities = [
    { name: '서울', lat: 37.5665, lng: 126.9780, radius: 0.5 },
    { name: '부산', lat: 35.1796, lng: 129.0756, radius: 0.5 },
    { name: '인천', lat: 37.4563, lng: 126.7052, radius: 0.5 },
    { name: '대구', lat: 35.8714, lng: 128.6014, radius: 0.5 },
    { name: '대전', lat: 36.3504, lng: 127.3845, radius: 0.5 },
    { name: '광주', lat: 35.1595, lng: 126.8526, radius: 0.5 },
    { name: '울산', lat: 35.5384, lng: 129.3114, radius: 0.5 },
  ];

  // 도시 선택 시 위치 검증
  const handleCitySelect = (cityName) => {
    setVerifyingCity(cityName);
    setError(null);

    if (!navigator.geolocation) {
      setError('위치 서비스를 지원하지 않는 브라우저입니다.');
      setVerifyingCity(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const targetCity = cities.find(c => c.name === cityName);

        if (!targetCity) {
          setError('도시 정보를 찾을 수 없습니다.');
          setVerifyingCity(null);
          return;
        }

        // 선택한 도시와의 거리 계산
        const distance = Math.sqrt(
          Math.pow(latitude - targetCity.lat, 2) + Math.pow(longitude - targetCity.lng, 2)
        );

        // 가장 가까운 도시 찾기
        let closestCity = '';
        let minDistance = Infinity;
        cities.forEach((city) => {
          const d = Math.sqrt(
            Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2)
          );
          if (d < minDistance) {
            minDistance = d;
            closestCity = city.name;
          }
        });

        // 선택한 도시가 현재 위치와 가까운지 확인 (반경 내 또는 가장 가까운 도시)
        if (distance <= targetCity.radius || closestCity === cityName) {
          setSelectedCity(cityName);
          setError(null);
        } else {
          setError(`현재 위치가 ${cityName} 지역이 아닙니다. 현재 위치는 ${closestCity} 근처입니다.`);
        }

        setVerifyingCity(null);
      },
      (err) => {
        console.error('Geolocation error:', err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('위치 권한을 허용해주세요. 위치 확인 후 지역을 선택할 수 있습니다.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.');
            break;
          case err.TIMEOUT:
            setError('위치 요청 시간이 초과되었습니다. 다시 시도해주세요.');
            break;
          default:
            setError('위치를 확인할 수 없습니다.');
        }
        setVerifyingCity(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 현재 위치로 자동 설정
  const detectLocation = () => {
    setDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 가장 가까운 도시 찾기
        let closestCity = '';
        let minDistance = Infinity;

        cities.forEach((city) => {
          const distance = Math.sqrt(
            Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city.name;
          }
        });

        if (closestCity) {
          setSelectedCity(closestCity);
        } else {
          setError('위치를 확인할 수 없습니다.');
        }

        setDetecting(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('위치 권한을 허용해주세요.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('위치 정보를 사용할 수 없습니다.');
            break;
          case err.TIMEOUT:
            setError('위치 요청 시간이 초과되었습니다.');
            break;
          default:
            setError('위치를 확인할 수 없습니다.');
        }
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 저장
  const handleSave = () => {
    if (!selectedCity) {
      setError('지역을 선택해주세요.');
      return;
    }

    onSave(selectedCity);
    onClose();
  };

  // 초기화
  useEffect(() => {
    if (isOpen && currentLocation) {
      // Check if currentLocation is one of our cities
      const isValidCity = cities.some(city => city.name === currentLocation);
      if (isValidCity) {
        setSelectedCity(currentLocation);
      }
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          <h2 className="text-lg font-bold">동네 설정</h2>
          <button
            onClick={handleSave}
            disabled={!selectedCity}
            className={`font-medium ${selectedCity ? 'text-orange-500' : 'text-gray-300'}`}
          >
            완료
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 현재 위치로 설정 버튼 */}
          <button
            onClick={detectLocation}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            {detecting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>위치 확인 중...</span>
              </>
            ) : (
              <>
                <i className="fas fa-crosshairs"></i>
                <span>현재 위치로 설정</span>
              </>
            )}
          </button>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 도시 선택 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">지역 선택</h3>
            <p className="text-xs text-gray-500 mb-3">
              <i className="fas fa-info-circle mr-1"></i>
              실제 위치 확인 후 해당 지역만 선택할 수 있습니다
            </p>
            <div className="grid grid-cols-2 gap-3">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
                  disabled={verifyingCity !== null || detecting}
                  className={`py-4 rounded-xl font-medium transition-colors relative ${
                    selectedCity === city.name
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                  }`}
                >
                  {verifyingCity === city.name ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      확인중
                    </span>
                  ) : (
                    city.name
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 선택된 위치 표시 */}
          {selectedCity && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">선택된 지역</p>
              <p className="text-xl font-bold text-gray-900">{selectedCity}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Make component globally available
window.LocationSettingModal = LocationSettingModal;
