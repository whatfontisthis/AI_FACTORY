import { useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
}

interface LocationError {
  message: string;
  code?: number;
}

// IP 기반 위치 서비스 (브라우저 geolocation 실패 시 대안)
async function getLocationByIP(): Promise<Location | null> {
  // ipapi.co - HTTPS 지원, 무료 (1000 요청/일)
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      console.log('IP-based location (ipapi.co):', data);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
      };
    }
  } catch (error) {
    console.warn('IP-based location (ipapi.co) failed:', error);
  }

  // 대안 API: ipwho.is - HTTPS 지원, 무료
  try {
    const response = await fetch('https://ipwho.is/');
    const data = await response.json();
    
    if (data.success && data.latitude && data.longitude) {
      console.log('IP-based location (ipwho.is):', data);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
      };
    }
  } catch (error) {
    console.warn('IP-based location (ipwho.is) failed:', error);
  }
  
  return null;
}

export function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    // 먼저 브라우저 geolocation 시도
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          });
        });
        
        console.log('Geolocation success:', position.coords);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
        return;
      } catch (geoError) {
        console.warn('Browser geolocation failed, trying IP-based location...', geoError);
      }
    }

    // 브라우저 geolocation 실패 시 IP 기반 위치 시도
    const ipLocation = await getLocationByIP();
    
    if (ipLocation) {
      setLocation(ipLocation);
      setIsLoading(false);
      return;
    }

    // 모든 방법 실패
    setError({ 
      message: '위치 정보를 가져올 수 없습니다. 아래에서 지역을 선택해주세요.', 
      code: 2 
    });
    setIsLoading(false);
  };

  return {
    location,
    error,
    isLoading,
    getCurrentLocation,
  };
}