# PRD: '오늘 뭐 먹지' MVP

## 1. 개요 (Overview)

### 1.1 프로젝트 비전
- **프로젝트명**: 오늘 뭐 먹지 (What Should I Eat Today)
- **핵심 가치**: "결정 장애 해결" + "맥락 기반 추천"
- **차별점**: 사용자가 메뉴를 직접 고민하는 것이 아니라, 시스템이 **외부 환경(날씨)**과 **내부 상태(기분)**를 자동으로 분석하여 최적의 메뉴를 제안
- **MVP 목표**: 최소한의 입력으로 최대의 만족도를 주는 가벼운 웹 앱 구현

### 1.2 타겟 사용자
- 매일 점심/저녁 메뉴 선택에 고민하는 직장인
- 날씨와 기분에 따른 맞춤 추천을 원하는 사용자
- 빠르고 간편한 의사결정을 원하는 사용자

---

## 2. 기술 스택 (Tech Stack)

| 구분 | 선택 기술 | 버전 | 사유 |
|------|-----------|------|------|
| **Framework** | Next.js (App Router) | 16.x | Turbopack 기본 번들러, Cache Components, 성능 최적화 |
| **Database** | Firebase Firestore | 12.x | NoSQL의 유연함 및 넉넉한 무료 티어 (Spark Plan) |
| **Styling** | Tailwind CSS | 4.x | CSS-first 설정, 더 간결한 구성, 빠른 UI 구현 |
| **Weather API** | OpenWeatherMap | - | 위도/경도 기반 실시간 날씨 (무료: 60회/분, 100만회/월) |
| **Deployment** | Vercel | - | CI/CD 자동화 및 환경 변수 관리 편의성 |

### 브라우저 요구사항
Tailwind CSS v4 사용으로 인해 최신 브라우저 필요:
- Safari 16.4+
- Chrome 111+
- Firefox 128+

---

## 3. 핵심 기능 (Core Features)

### 3.1 자동 날씨 동기화
- 브라우저 `Geolocation API`로 사용자 위치(좌표) 획득
- Next.js Route Handler를 통해 OpenWeatherMap API 호출 (API Key 보호)
- 현재 날씨 상태를 전역 상태로 저장 및 UI에 표시

### 3.2 감정 선택 UI
5가지 직관적인 이모지 버튼으로 현재 기분 선택:
- 🔥 **stress** (스트레스)
- 😴 **tired** (피곤함)
- 🥳 **happy** (신남)
- 😔 **sad** (우울함)
- 🤔 **normal** (평범함)

### 3.3 메뉴 추천 시스템
- 날씨와 기분 기반 가중치 점수 계산
- 최고 점수 메뉴 그룹에서 무작위 선정
- 추천 결과 카드 애니메이션 표시

### 3.4 추천 결과 카드
- 메뉴 이름 및 카테고리
- 음식 이미지
- 추천 사유 (예: "비 오는 날엔 스트레스 풀리는 매운맛!")
- 다시 추천 받기 버튼

---

## 4. 추천 알고리즘 (Recommendation Logic)

### 4.1 가중치 기반 점수제 (Weighted Scoring System)

```
Score = (W × w_weather) + (M × w_mood)
```

| 변수 | 설명 | 값 |
|------|------|-----|
| W | 날씨 일치 여부 | 0 또는 1 |
| M | 기분 일치 여부 | 0 또는 1 |
| w_weather | 날씨 가중치 | 0.4 |
| w_mood | 기분 가중치 | 0.6 |

> 사용자 주관적 상태(기분)에 더 높은 우선순위 부여

### 4.2 프로세스 흐름

1. **Data Fetch**: Firestore에서 전체 메뉴(`menus` collection) 조회
2. **Scoring**: 각 메뉴의 태그와 현재 데이터(`currentWeather`, `selectedMood`) 대조하여 점수 합산
3. **Filtering**: 최고 점수를 받은 메뉴 그룹(Max Score Group) 추출
4. **Random Pick**: 최고 점수 그룹 내에서 1개의 메뉴를 무작위 선정하여 최종 노출

---

## 5. 데이터베이스 구조 (Firestore Schema)

### Collection: `menus`

| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `name` | string | 메뉴 이름 | "마라탕" |
| `category` | string | 음식 분류 | "중식" |
| `weather_tags` | array | 매칭 날씨 태그 | `["Rain", "Clouds"]` |
| `mood_tags` | array | 매칭 기분 태그 | `["stress", "tired"]` |
| `image_url` | string | 음식 사진 URL | "https://..." |

### 날씨 태그 (Weather Tags)
- `Clear` - 맑음
- `Clouds` - 흐림
- `Rain` - 비
- `Snow` - 눈
- `Thunderstorm` - 천둥번개
- `Drizzle` - 이슬비
- `Mist` - 안개

### 기분 태그 (Mood Tags)
- `stress` - 스트레스
- `tired` - 피곤함
- `happy` - 신남
- `sad` - 우울함
- `normal` - 평범함

---

## 6. API 설계

### 6.1 GET /api/weather
현재 위치의 날씨 정보 조회

**Request Query:**
```
?lat={latitude}&lon={longitude}
```

**Response:**
```json
{
  "weather": "Rain",
  "description": "light rain",
  "temp": 15,
  "icon": "10d"
}
```

### 6.2 GET /api/recommend
메뉴 추천 API

**Request Query:**
```
?weather={weather}&mood={mood}
```

**Response:**
```json
{
  "menu": {
    "name": "마라탕",
    "category": "중식",
    "image_url": "https://...",
    "reason": "비 오는 날엔 스트레스 풀리는 매운맛!"
  }
}
```

---

## 7. UI/UX 설계

### 7.1 화면 구성

#### 메인 화면
1. **헤더**: 앱 로고/타이틀
2. **날씨 카드**: 현재 위치 및 날씨 상태 표시
3. **기분 선택 섹션**: 5개 이모지 버튼
4. **추천 받기 버튼**: CTA 버튼
5. **결과 카드**: 추천 메뉴 표시 (애니메이션)

### 7.2 반응형 디자인
- Mobile-first 접근
- Breakpoints: sm(640px), md(768px), lg(1024px)

---

## 8. 비기능 요구사항

### 8.1 보안
- API Key는 환경 변수로 관리
- 날씨 API 호출은 Server-side (Route Handler)에서만 수행

### 8.2 성능
- 메뉴 데이터 캐싱 고려
- 이미지 최적화 (Next.js Image 컴포넌트)

### 8.3 사용자 경험
- Local Storage에 마지막 선택 기분 저장
- 로딩 상태 표시
- 에러 핸들링 및 사용자 친화적 메시지

---

## 9. 초기 데이터 (Seed Data)

### 샘플 메뉴 데이터

```json
[
  {
    "name": "마라탕",
    "category": "중식",
    "weather_tags": ["Rain", "Clouds", "Snow"],
    "mood_tags": ["stress", "tired"],
    "image_url": "/images/malatang.jpg"
  },
  {
    "name": "삼겹살",
    "category": "한식",
    "weather_tags": ["Clear", "Clouds"],
    "mood_tags": ["happy", "stress"],
    "image_url": "/images/samgyeopsal.jpg"
  },
  {
    "name": "초밥",
    "category": "일식",
    "weather_tags": ["Clear", "Clouds"],
    "mood_tags": ["happy", "normal"],
    "image_url": "/images/sushi.jpg"
  },
  {
    "name": "된장찌개",
    "category": "한식",
    "weather_tags": ["Rain", "Clouds", "Snow"],
    "mood_tags": ["sad", "tired", "normal"],
    "image_url": "/images/doenjangjjigae.jpg"
  },
  {
    "name": "파스타",
    "category": "양식",
    "weather_tags": ["Clear", "Clouds"],
    "mood_tags": ["happy", "normal"],
    "image_url": "/images/pasta.jpg"
  },
  {
    "name": "떡볶이",
    "category": "분식",
    "weather_tags": ["Rain", "Clouds", "Snow"],
    "mood_tags": ["stress", "sad"],
    "image_url": "/images/tteokbokki.jpg"
  },
  {
    "name": "치킨",
    "category": "양식",
    "weather_tags": ["Rain", "Clear", "Clouds"],
    "mood_tags": ["happy", "stress", "sad"],
    "image_url": "/images/chicken.jpg"
  },
  {
    "name": "냉면",
    "category": "한식",
    "weather_tags": ["Clear"],
    "mood_tags": ["tired", "normal"],
    "image_url": "/images/naengmyeon.jpg"
  },
  {
    "name": "라멘",
    "category": "일식",
    "weather_tags": ["Rain", "Clouds", "Snow"],
    "mood_tags": ["tired", "sad"],
    "image_url": "/images/ramen.jpg"
  },
  {
    "name": "샐러드",
    "category": "양식",
    "weather_tags": ["Clear"],
    "mood_tags": ["normal", "happy"],
    "image_url": "/images/salad.jpg"
  }
]
```

---

## 10. 환경 변수

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# OpenWeatherMap
OPENWEATHER_API_KEY=
```

---

## 11. 배포 체크리스트

- [ ] Vercel 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] Firebase 프로젝트 설정 및 Firestore 활성화
- [ ] 초기 메뉴 데이터 Firestore에 입력
- [ ] 도메인 연결 (선택)
