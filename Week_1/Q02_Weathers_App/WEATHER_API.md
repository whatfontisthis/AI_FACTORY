# 날씨 API 연동 문서

## 개요
이 프로젝트는 OpenWeatherMap API와 연동하여 실시간 날씨 데이터를 제공하는 백엔드 기능을 구현합니다.

## API 엔드포인트

### 1. 현재 날씨 정보
- **엔드포인트**: `/api/weather`
- **메소드**: `GET`
- **파라미터**:
  - `lat` (선택): 위도
  - `lon` (선택): 경도  
  - `city` (선택): 도시 이름

**요청 예시**:
```
GET /api/weather?city=서울
GET /api/weather?lat=37.5665&lon=126.9780
```

**응답 형식**:
```json
{
  "location": {
    "name": "서울",
    "country": "KR",
    "lat": 37.5665,
    "lon": 126.9780
  },
  "current": {
    "temperature": 24,
    "feelsLike": 26,
    "description": "맑음",
    "icon": "01d",
    "humidity": 65,
    "pressure": 1013,
    "windSpeed": 3.2,
    "windDirection": 180,
    "visibility": 10,
    "uvIndex": null
  },
  "temp": {
    "min": 18,
    "max": 28
  },
  "sys": {
    "sunrise": "2024-01-18T06:12:00.000Z",
    "sunset": "2024-01-18T19:48:00.000Z"
  }
}
```

### 2. 일기 예보
- **엔드포인트**: `/api/weather/forecast`
- **메소드**: `GET`
- **파라미터**:
  - `lat` (선택): 위도
  - `lon` (선택): 경도
  - `city` (선택): 도시 이름
  - `days` (선택): 예보 일수 (기본값: 7)

**요청 예시**:
```
GET /api/weather/forecast?city=서울&days=5
```

**응답 형식**:
```json
{
  "location": {
    "name": "서울",
    "country": "KR",
    "lat": 37.5665,
    "lon": 126.9780
  },
  "forecast": [
    {
      "date": "Thu Jan 18 2024",
      "temp": {
        "min": 18,
        "max": 28
      },
      "weather": {
        "main": "Clear",
        "description": "맑음",
        "icon": "01d"
      },
      "humidity": 65,
      "windSpeed": 3.2
    }
  ]
}
```

## 설정

### 환경 변수 설정
1. `.env.local` 파일을 생성합니다
2. OpenWeatherMap에서 API 키를 발급받습니다: https://openweathermap.org/api
3. 다음 내용을 `.env.local` 파일에 추가합니다:

```env
OPENWEATHER_API_KEY=your_actual_api_key_here
```

## 서비스 클래스

### WeatherService
`services/weatherService.ts`에 구현된 서비스 클래스를 통해 API를 쉽게 호출할 수 있습니다.

```typescript
import { WeatherService } from '@/services/weatherService';

// 현재 날씨 가져오기
const weather = await WeatherService.getCurrentWeather({
  city: '서울'
});

// 일기 예보 가져오기
const forecast = await WeatherService.getForecast({
  lat: 37.5665,
  lon: 126.9780,
  days: 5
});
```

## 에러 처리

API는 다음과 같은 에러 상황을 처리합니다:

- **400**: 필요한 파라미터가 없는 경우
- **401**: API 키가 없거나 유효하지 않은 경우
- **404**: 도시를 찾을 수 없는 경우
- **500**: 서버 내부 오류 또는 외부 API 오류

## 특징

- **자동 한국어 지원**: OpenWeatherMap API 응답을 한국어로 변환
- **데이터 포맷팅**: 섭씨 온도, 미터 단위 등 사용자 친화적인 단위로 변환
- **캐싱 지원**: 향후 캐싱 기능 추가 용이
- **타입스크립트 지원**: 완전한 타입 정의 제공

## 테스트

개발 환경에서 테스트하려면:
1. 개발 서버를 시작합니다: `npm run dev -- --port 3001`
2. API 테스트를 진행합니다

## 의존성

- `axios`: HTTP 클라이언트 라이브러리
- `next.js`: API 라우트 지원