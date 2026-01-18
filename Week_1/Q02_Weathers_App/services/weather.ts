interface WeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
}

interface ForecastData {
  location: WeatherData['location'];
  current: WeatherData['current'];
  forecast: {
    forecastday: Array<{
      date: string;
      date_epoch: number;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        maxtemp_f: number;
        mintemp_f: number;
        avgtemp_f: number;
        maxwind_mph: number;
        maxwind_kph: number;
        totalprecip_mm: number;
        totalprecip_in: number;
        totalsnow_cm: number;
        avgvis_km: number;
        avgvis_miles: number;
        avghumidity: number;
        daily_will_it_rain: number;
        daily_chance_of_rain: number;
        daily_will_it_snow: number;
        daily_chance_of_snow: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        uv: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
        is_moon_up: number;
        is_sun_up: number;
      };
      hour: Array<{
        time_epoch: number;
        time: string;
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        wind_mph: number;
        wind_kph: number;
        wind_degree: number;
        wind_dir: string;
        pressure_mb: number;
        pressure_in: number;
        precip_mm: number;
        precip_in: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        feelslike_f: number;
        windchill_c: number;
        windchill_f: number;
        heatindex_c: number;
        heatindex_f: number;
        dewpoint_c: number;
        dewpoint_f: number;
        will_it_rain: number;
        chance_of_rain: number;
        will_it_snow: number;
        chance_of_snow: number;
        vis_km: number;
        vis_miles: number;
        gust_mph: number;
        gust_kph: number;
        uv: number;
      }>;
    }>;
  };
}

// Weather code to Korean text mapping
const weatherCodeMap: { [key: number]: string } = {
  0: '맑음',
  1: '대체로 맑음',
  2: '부분적으로 흐림',
  3: '흐림',
  45: '안개',
  48: '서리 안개',
  51: '약한 이슬비',
  53: '중간 이슬비',
  55: '강한 이슬비',
  56: '약한 진눈깨비',
  57: '강한 진눈깨비',
  61: '약한 비',
  63: '중간 비',
  65: '강한 비',
  66: '얼음 비',
  67: '강한 얼음 비',
  71: '약한 눈',
  73: '중간 눈',
  75: '강한 눈',
  77: '눈알',
  80: '약한 소나기',
  81: '중간 소나기',
  82: '강한 소나기',
  85: '약한 눈 소나기',
  86: '강한 눈 소나기',
  95: '천둥번개',
  96: '우박과 함께하는 천둥번개',
  99: '강한 우박과 함께하는 천둥번개',
};

const getWeatherText = (code: number): string => {
  return weatherCodeMap[code] || '알 수 없음';
};

const getWeatherEmoji = (code: number): string => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2 || code === 3) return '☁️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 86) return '🌧️';
  if (code >= 95 && code <= 99) return '⛈️';
  if (code === 45 || code === 48) return '🌫️';
  return '🌤️';
};

class WeatherService {
  private baseUrl = 'https://api.open-meteo.com/v1';

  // Korean region coordinates mapping
  private koreanRegionCoords: { [key: string]: { lat: number; lon: number; name: string } } = {
    '서울특별시': { lat: 37.5665, lon: 126.9780, name: '서울' },
    '서울': { lat: 37.5665, lon: 126.9780, name: '서울' },
    '서울특별시 종로구': { lat: 37.5735, lon: 126.9788, name: '종로구' },
    '서울특별시 종로구 경복궁': { lat: 37.5796, lon: 126.9770, name: '경복궁' },
    '서울특별시 종로구 광화문': { lat: 37.5755, lon: 126.9769, name: '광화문' },
    '서울특별시 강남구': { lat: 37.5172, lon: 127.0473, name: '강남구' },
    '서울특별시 강남구 강남역': { lat: 37.4980, lon: 127.0276, name: '강남역' },
    '서울특별시 중구 명동': { lat: 37.5636, lon: 126.9826, name: '명동' },
    '서울특별시 마포구 홍대': { lat: 37.5563, lon: 126.9236, name: '홍대' },
    '서울특별시 용산구 이태원': { lat: 37.5345, lon: 126.9946, name: '이태원' },
    '서울특별시 중구 동대문': { lat: 37.5714, lon: 127.0095, name: '동대문' },
    '부산광역시': { lat: 35.1796, lon: 129.0756, name: '부산' },
    '부산': { lat: 35.1796, lon: 129.0756, name: '부산' },
    '부산광역시 해운대구': { lat: 35.1631, lon: 129.1636, name: '해운대구' },
    '부산광역시 해운대구 해운대해수욕장': { lat: 35.1587, lon: 129.1604, name: '해운대해수욕장' },
    '부산광역시 수영구 광안리': { lat: 35.1532, lon: 129.1186, name: '광안리' },
    '부산광역시 중구 남포동': { lat: 35.0979, lon: 129.0304, name: '남포동' },
    '대구광역시': { lat: 35.8714, lon: 128.6014, name: '대구' },
    '대구': { lat: 35.8714, lon: 128.6014, name: '대구' },
    '대구광역시 중구 서문시장': { lat: 35.8694, lon: 128.5956, name: '서문시장' },
    '인천광역시': { lat: 37.4563, lon: 126.7052, name: '인천' },
    '인천': { lat: 37.4563, lon: 126.7052, name: '인천' },
    '인천광역시 연수구 송도': { lat: 37.3885, lon: 126.6586, name: '송도' },
    '광주광역시': { lat: 35.1595, lon: 126.8526, name: '광주' },
    '광주': { lat: 35.1595, lon: 126.8526, name: '광주' },
    '대전광역시': { lat: 36.3504, lon: 127.3845, name: '대전' },
    '대전': { lat: 36.3504, lon: 127.3845, name: '대전' },
    '울산광역시': { lat: 35.5384, lon: 129.3114, name: '울산' },
    '울산': { lat: 35.5384, lon: 129.3114, name: '울산' },
    '세종특별자치시': { lat: 36.4800, lon: 127.2890, name: '세종' },
    '세종': { lat: 36.4800, lon: 127.2890, name: '세종' },
    '경기도': { lat: 37.4138, lon: 127.5183, name: '경기도' },
    '경기도 수원시': { lat: 37.2636, lon: 127.0286, name: '수원' },
    '수원': { lat: 37.2636, lon: 127.0286, name: '수원' },
    '경기도 성남시': { lat: 37.4201, lon: 127.1267, name: '성남' },
    '성남': { lat: 37.4201, lon: 127.1267, name: '성남' },
    '경기도 성남시 분당구': { lat: 37.3846, lon: 127.1110, name: '분당구' },
    '경기도 성남시 분당구 판교': { lat: 37.3948, lon: 127.1112, name: '판교' },
    '경기도 안양시': { lat: 37.3925, lon: 126.9269, name: '안양' },
    '안양': { lat: 37.3925, lon: 126.9269, name: '안양' },
    '경기도 부천시': { lat: 37.5034, lon: 126.7660, name: '부천' },
    '부천': { lat: 37.5034, lon: 126.7660, name: '부천' },
    '경기도 광명시': { lat: 37.4772, lon: 126.8664, name: '광명' },
    '광명': { lat: 37.4772, lon: 126.8664, name: '광명' },
    '경기도 평택시': { lat: 36.9920, lon: 127.1129, name: '평택' },
    '평택': { lat: 36.9920, lon: 127.1129, name: '평택' },
    '경기도 의정부시': { lat: 37.7381, lon: 127.0477, name: '의정부' },
    '의정부': { lat: 37.7381, lon: 127.0477, name: '의정부' },
    '경기도 동두천시': { lat: 37.9034, lon: 127.0607, name: '동두천' },
    '동두천': { lat: 37.9034, lon: 127.0607, name: '동두천' },
    '경기도 안산시': { lat: 37.3219, lon: 126.8309, name: '안산' },
    '안산': { lat: 37.3219, lon: 126.8309, name: '안산' },
    '경기도 고양시': { lat: 37.6584, lon: 126.8320, name: '고양' },
    '고양': { lat: 37.6584, lon: 126.8320, name: '고양' },
    '경기도 고양시 일산구': { lat: 37.6847, lon: 126.7702, name: '일산구' },
    '일산': { lat: 37.6847, lon: 126.7702, name: '일산' },
    '강원도': { lat: 37.8228, lon: 128.1555, name: '강원도' },
    '강원도 춘천시': { lat: 37.8813, lon: 127.7298, name: '춘천' },
    '춘천': { lat: 37.8813, lon: 127.7298, name: '춘천' },
    '강원도 강릉시': { lat: 37.7519, lon: 128.8761, name: '강릉' },
    '강릉': { lat: 37.7519, lon: 128.8761, name: '강릉' },
    '강릉시': { lat: 37.7519, lon: 128.8761, name: '강릉' },
    '강원도 속초시': { lat: 38.2070, lon: 128.5918, name: '속초' },
    '속초': { lat: 38.2070, lon: 128.5918, name: '속초' },
    '강원도 평창군': { lat: 37.5637, lon: 128.3900, name: '평창' },
    '평창': { lat: 37.5637, lon: 128.3900, name: '평창' },
    '충청북도': { lat: 36.8000, lon: 127.7000, name: '충청북도' },
    '충청북도 청주시': { lat: 36.6424, lon: 127.4890, name: '청주' },
    '청주': { lat: 36.6424, lon: 127.4890, name: '청주' },
    '충청남도': { lat: 36.5184, lon: 126.8000, name: '충청남도' },
    '충청남도 천안시': { lat: 36.8151, lon: 127.1139, name: '천안' },
    '천안': { lat: 36.8151, lon: 127.1139, name: '천안' },
    '전라북도': { lat: 35.7175, lon: 127.1530, name: '전라북도' },
    '전라북도 전주시': { lat: 35.8242, lon: 127.1480, name: '전주' },
    '전주': { lat: 35.8242, lon: 127.1480, name: '전주' },
    '전라남도': { lat: 34.8679, lon: 126.9910, name: '전라남도' },
    '전라남도 목포시': { lat: 34.8118, lon: 126.3922, name: '목포' },
    '목포': { lat: 34.8118, lon: 126.3922, name: '목포' },
    '전라남도 여수시': { lat: 34.7604, lon: 127.6622, name: '여수' },
    '여수': { lat: 34.7604, lon: 127.6622, name: '여수' },
    '경상북도': { lat: 36.4919, lon: 128.8889, name: '경상북도' },
    '경상북도 포항시': { lat: 36.0322, lon: 129.3650, name: '포항' },
    '포항': { lat: 36.0322, lon: 129.3650, name: '포항' },
    '경상북도 경주시': { lat: 35.8562, lon: 129.2247, name: '경주' },
    '경주': { lat: 35.8562, lon: 129.2247, name: '경주' },
    '경상남도': { lat: 35.4606, lon: 128.2132, name: '경상남도' },
    '경상남도 창원시': { lat: 35.2279, lon: 128.6817, name: '창원' },
    '창원': { lat: 35.2279, lon: 128.6817, name: '창원' },
    '경상남도 진주시': { lat: 35.1927, lon: 128.0847, name: '진주' },
    '진주': { lat: 35.1927, lon: 128.0847, name: '진주' },
    '제주특별자치도': { lat: 33.4996, lon: 126.5312, name: '제주' },
    '제주': { lat: 33.4996, lon: 126.5312, name: '제주' },
    '제주도': { lat: 33.4996, lon: 126.5312, name: '제주' },
    '제주특별자치도 제주시': { lat: 33.4996, lon: 126.5312, name: '제주시' },
    '제주시': { lat: 33.4996, lon: 126.5312, name: '제주시' },
    '제주특별자치도 서귀포시': { lat: 33.2541, lon: 126.5600, name: '서귀포' },
    '서귀포': { lat: 33.2541, lon: 126.5600, name: '서귀포' },
    '제주특별자치도 한라산': { lat: 33.3617, lon: 126.5292, name: '한라산' },
    '한라산': { lat: 33.3617, lon: 126.5292, name: '한라산' },
  };

  // Get location coordinates from city name (using geocoding)
  private async getCoordinates(location: string): Promise<{ lat: number; lon: number; name: string } | null> {
    // First check our Korean region coordinates mapping
    if (this.koreanRegionCoords[location]) {
      return this.koreanRegionCoords[location];
    }

    // Try simplified location name (extract main city name)
    const simplifiedLocation = this.simplifyLocationName(location);
    if (simplifiedLocation && this.koreanRegionCoords[simplifiedLocation]) {
      return this.koreanRegionCoords[simplifiedLocation];
    }

    // Try Open-Meteo geocoding API as fallback
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=ko`
      );
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        if (geoData.results && geoData.results.length > 0) {
          const result = geoData.results[0];
          return {
            lat: result.latitude,
            lon: result.longitude,
            name: result.name,
          };
        }
      }
    } catch (error) {
      console.warn('Geocoding failed:', error);
    }
    return null;
  }

  // Simplify Korean location names (e.g., "서울특별시 마포구 홍대" -> "서울특별시 마포구 홍대" or "서울")
  private simplifyLocationName(location: string): string | null {
    // Try to extract main city name
    if (location.includes('서울')) return '서울특별시';
    if (location.includes('부산')) return '부산광역시';
    if (location.includes('대구')) return '대구광역시';
    if (location.includes('인천')) return '인천광역시';
    if (location.includes('광주')) return '광주광역시';
    if (location.includes('대전')) return '대전광역시';
    if (location.includes('울산')) return '울산광역시';
    if (location.includes('세종')) return '세종특별자치시';
    if (location.includes('강릉')) return '강원도 강릉시';
    if (location.includes('춘천')) return '강원도 춘천시';
    if (location.includes('속초')) return '강원도 속초시';
    if (location.includes('수원')) return '경기도 수원시';
    if (location.includes('성남')) return '경기도 성남시';
    if (location.includes('안양')) return '경기도 안양시';
    if (location.includes('부천')) return '경기도 부천시';
    if (location.includes('제주')) return '제주특별자치도';
    
    return null;
  }

  private formatOpenMeteoToWeatherData(
    locationName: string,
    lat: number,
    lon: number,
    currentData: any,
    forecastData: any
  ): ForecastData {
    const current = currentData.current;
    const hourly = forecastData.hourly;
    const daily = forecastData.daily;

    // Get current weather
    const currentWeather: WeatherData['current'] = {
      last_updated_epoch: current.time,
      last_updated: new Date(current.time * 1000).toLocaleString('ko-KR'),
      temp_c: Math.round(current.temperature_2m),
      temp_f: Math.round(current.temperature_2m * 9/5 + 32),
      is_day: current.is_day,
      condition: {
        text: getWeatherText(current.weather_code),
        icon: '',
        code: current.weather_code,
      },
      wind_mph: current.wind_speed_10m * 0.621371,
      wind_kph: current.wind_speed_10m,
      wind_degree: current.wind_direction_10m,
      wind_dir: this.getWindDirection(current.wind_direction_10m),
      pressure_mb: Math.round(current.surface_pressure),
      pressure_in: Math.round(current.surface_pressure * 0.02953),
      precip_mm: current.precipitation || 0,
      precip_in: (current.precipitation || 0) * 0.03937,
      humidity: current.relative_humidity_2m,
      cloud: current.cloud_cover || 0,
      feelslike_c: Math.round(current.apparent_temperature),
      feelslike_f: Math.round(current.apparent_temperature * 9/5 + 32),
      vis_km: current.visibility / 1000 || 10,
      vis_miles: (current.visibility / 1000 || 10) * 0.621371,
      uv: current.uv_index || 0,
      gust_mph: (current.wind_gusts_10m || current.wind_speed_10m) * 0.621371,
      gust_kph: current.wind_gusts_10m || current.wind_speed_10m,
    };

    // Format forecast days
    const forecastday = [];
    const today = new Date();
    
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const date = new Date(daily.time[i]);
      const sunrise = daily.sunrise ? new Date(daily.sunrise[i]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '06:00';
      const sunset = daily.sunset ? new Date(daily.sunset[i]).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '18:00';

      forecastday.push({
        date: daily.time[i],
        date_epoch: date.getTime() / 1000,
        day: {
          maxtemp_c: Math.round(daily.temperature_2m_max[i]),
          mintemp_c: Math.round(daily.temperature_2m_min[i]),
          avgtemp_c: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
          maxtemp_f: Math.round(daily.temperature_2m_max[i] * 9/5 + 32),
          mintemp_f: Math.round(daily.temperature_2m_min[i] * 9/5 + 32),
          avgtemp_f: Math.round(((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2) * 9/5 + 32),
          maxwind_mph: daily.wind_speed_10m_max[i] * 0.621371,
          maxwind_kph: daily.wind_speed_10m_max[i],
          totalprecip_mm: daily.precipitation_sum[i] || 0,
          totalprecip_in: (daily.precipitation_sum[i] || 0) * 0.03937,
          totalsnow_cm: daily.snowfall_sum[i] || 0,
          avgvis_km: 10,
          avgvis_miles: 6,
          avghumidity: daily.relative_humidity_2m_mean[i] || 65,
          daily_will_it_rain: daily.precipitation_sum[i] > 0 ? 1 : 0,
          daily_chance_of_rain: Math.round((daily.precipitation_sum[i] > 0 ? 50 : 0) + Math.random() * 30),
          daily_will_it_snow: daily.snowfall_sum[i] > 0 ? 1 : 0,
          daily_chance_of_snow: daily.snowfall_sum[i] > 0 ? 30 : 0,
          condition: {
            text: getWeatherText(daily.weather_code[i]),
            icon: '',
            code: daily.weather_code[i],
          },
          uv: Math.round(daily.uv_index_max[i] || 5),
        },
        astro: {
          sunrise,
          sunset,
          moonrise: '12:00',
          moonset: '02:00',
          moon_phase: 'First Quarter',
          moon_illumination: '50',
          is_moon_up: 0,
          is_sun_up: date.getHours() >= 6 && date.getHours() < 18 ? 1 : 0,
        },
        hour: [],
      });
    }

    return {
      location: {
        name: locationName,
        country: 'South Korea',
        region: locationName.includes('서울') ? 'Seoul' : locationName.includes('부산') ? 'Busan' : 'Unknown',
        lat,
        lon,
        tz_id: 'Asia/Seoul',
        localtime_epoch: Date.now() / 1000,
        localtime: new Date().toLocaleString('ko-KR'),
      },
      current: currentWeather,
      forecast: {
        forecastday,
      },
    };
  }

  private getWindDirection(degree: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degree / 22.5) % 16];
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    const coords = await this.getCoordinates(location);
    if (!coords) {
      throw new Error(`지역을 찾을 수 없습니다: ${location}`);
    }

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(
        `${this.baseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility&timezone=Asia%2FSeoul`
      ),
      fetch(
        `${this.baseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,relative_humidity_2m_mean,uv_index_max,sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=7`
      ),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('날씨 데이터를 가져올 수 없습니다.');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    const formatted = this.formatOpenMeteoToWeatherData(coords.name, coords.lat, coords.lon, currentData, forecastData);
    
    return {
      location: formatted.location,
      current: formatted.current,
    };
  }

  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    const locationName = `위도 ${lat.toFixed(2)}, 경도 ${lon.toFixed(2)}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility&timezone=Asia%2FSeoul`
      ),
      fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,relative_humidity_2m_mean,uv_index_max,sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=7`
      ),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('날씨 데이터를 가져올 수 없습니다.');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    const formatted = this.formatOpenMeteoToWeatherData(locationName, lat, lon, currentData, forecastData);
    
    return {
      location: formatted.location,
      current: formatted.current,
    };
  }

  async getForecast(location: string, days: number = 7): Promise<ForecastData> {
    const coords = await this.getCoordinates(location);
    if (!coords) {
      throw new Error(`지역을 찾을 수 없습니다: ${location}`);
    }

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(
        `${this.baseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility&timezone=Asia%2FSeoul`
      ),
      fetch(
        `${this.baseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,relative_humidity_2m_mean,uv_index_max,sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=${days}`
      ),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('날씨 예보를 가져올 수 없습니다.');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    return this.formatOpenMeteoToWeatherData(coords.name, coords.lat, coords.lon, currentData, forecastData);
  }

  async getForecastByCoords(lat: number, lon: number, days: number = 7): Promise<ForecastData> {
    const locationName = `위도 ${lat.toFixed(2)}, 경도 ${lon.toFixed(2)}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility&timezone=Asia%2FSeoul`
      ),
      fetch(
        `${this.baseUrl}/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,relative_humidity_2m_mean,uv_index_max,sunrise,sunset&timezone=Asia%2FSeoul&forecast_days=${days}`
      ),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('날씨 예보를 가져올 수 없습니다.');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();
    return this.formatOpenMeteoToWeatherData(locationName, lat, lon, currentData, forecastData);
  }

}

export const weatherService = new WeatherService();
export type { WeatherData, ForecastData };
