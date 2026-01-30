# 🤖 에이전트 오케스트레이션 문서: '오늘 뭐 먹지' MVP

> **이 문서는 AI 에이전트가 프로젝트를 체계적으로 진행하기 위한 마스터 문서입니다.**
> 
> 에이전트는 이 문서만 참조하여 현재 진행 상태를 파악하고, 다음 작업을 수행하세요.

---

## 📊 프로젝트 진행 현황

| Phase | 설명 | 상태 | 완료일 |
|-------|------|------|--------|
| Phase 1 | 프로젝트 초기 설정 | ✅ 완료 | - |
| Phase 2 | Firebase 설정 | ✅ 완료 | - |
| Phase 3 | API Route 개발 | ✅ 완료 | - |
| Phase 4 | 핵심 로직 개발 | ✅ 완료 | - |
| Phase 5 | UI 컴포넌트 개발 | ✅ 완료 | - |
| Phase 6 | 메인 페이지 통합 | ✅ 완료 | - |
| Phase 7 | 스타일링 & UX | ⬜ 대기 | - |
| Phase 8 | 테스트 & 최적화 | ⬜ 대기 | - |
| Phase 9 | 배포 | ⬜ 대기 | - |

**현재 Phase**: Phase 7 (스타일링 & UX)  
**마지막 업데이트**: 2026-01-29

---

## 🎯 에이전트 작업 지침

### 작업 시작 전 확인사항
1. 위 "프로젝트 진행 현황" 테이블에서 현재 Phase 확인
2. 해당 Phase의 체크리스트에서 ⬜ (미완료) 항목 찾기
3. 작업 완료 후 반드시 체크리스트를 ✅로 업데이트
4. Phase 완료 시 진행 현황 테이블의 상태를 ✅ 완료로 변경

### 상태 표시 규칙
- ⬜ 대기/미완료
- 🔄 진행 중
- ✅ 완료
- ⛔ 블로커 (선행 작업 필요)

---

## 🛠️ 기술 스택

| 구분 | 선택 기술 | 버전 | 사유 |
|------|-----------|------|------|
| **Framework** | Next.js (App Router) | 16.x | Turbopack 기본 번들러, Cache Components |
| **Database** | Firebase Firestore | 12.x | NoSQL, 무료 티어 (Spark Plan) |
| **Styling** | Tailwind CSS | 4.x | CSS-first 설정, 빠른 UI 구현 |
| **Weather API** | OpenWeatherMap | - | 무료: 60회/분, 100만회/월 |
| **Deployment** | Vercel | - | CI/CD 자동화 |

**브라우저 요구사항**: Safari 16.4+, Chrome 111+, Firefox 128+

---

## 📁 목표 프로젝트 구조

```
q3/
├── PRD.md                    # 상세 기획 문서 (참고용)
├── plan.md                   # 이 문서 (에이전트 오케스트레이션)
├── package.json
├── next.config.ts            # Next.js 16 설정
├── postcss.config.mjs        # Tailwind CSS v4 PostCSS 설정
├── tsconfig.json
├── .env.local                # 환경 변수 (git 제외)
├── .env.example              # 환경 변수 템플릿
├── public/
│   └── images/               # 음식 이미지
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── weather/
│   │   │   │   └── route.ts
│   │   │   └── recommend/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css       # Tailwind CSS v4 진입점
│   ├── components/
│   │   ├── WeatherCard.tsx
│   │   ├── MoodSelector.tsx
│   │   ├── RecommendButton.tsx
│   │   └── ResultCard.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   └── recommendation.ts
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   └── useWeather.ts
│   └── types/
│       └── index.ts
└── scripts/
    └── seed-firestore.ts     # Firestore 초기 데이터 시드
```

> **참고**: Tailwind CSS v4에서는 `tailwind.config.js`가 불필요합니다. 모든 설정은 `globals.css`에서 `@theme` 디렉티브로 관리합니다.

---

## Phase 1: 프로젝트 초기 설정

### 체크리스트
- [x] **1.1** Next.js 16 프로젝트 생성 (App Router, TypeScript)
- [x] **1.2** Tailwind CSS v4 설치 및 설정
- [x] **1.3** 환경 변수 파일 생성
- [x] **1.4** 프로젝트 폴더 구조 생성
- [x] **1.5** 기본 레이아웃 설정

### 1.1 Next.js 16 프로젝트 생성
```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*"
```

> **주의**: `--tailwind` 옵션을 사용하지 않습니다. Tailwind CSS v4는 별도로 설치합니다.

### 1.2 Tailwind CSS v4 설치 및 설정

**패키지 설치**:
```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

**postcss.config.mjs 생성** (프로젝트 루트):
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

**src/app/globals.css 수정**:
```css
@import "tailwindcss";

/* 커스텀 테마 설정 (Tailwind CSS v4 방식) */
@theme {
  /* 프로젝트 커스텀 컬러 */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;
  
  /* 기분별 컬러 */
  --color-mood-stress: #ef4444;
  --color-mood-tired: #8b5cf6;
  --color-mood-happy: #22c55e;
  --color-mood-sad: #6366f1;
  --color-mood-normal: #64748b;
}

/* 기본 스타일 */
body {
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}
```

> **Tailwind CSS v4 변경사항**: 
> - `tailwind.config.js` 불필요 (모든 설정은 CSS에서)
> - `@import "tailwindcss"` 사용 (기존 `@tailwind` 디렉티브 대체)
> - `@theme` 디렉티브로 커스텀 변수 정의 → 자동으로 유틸리티 클래스 생성 (예: `bg-primary`)

### 1.3 환경 변수 파일

**.env.example** (커밋용 템플릿):
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

**.env.local** (실제 값 - git 제외):
```env
# Firebase - Firebase Console에서 획득
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenWeatherMap - https://openweathermap.org/api 에서 획득
OPENWEATHER_API_KEY=your_openweather_api_key
```

### 1.5 기본 레이아웃 설정
`src/app/layout.tsx`에 기본 메타데이터 설정:
- 타이틀: "오늘 뭐 먹지?"
- 설명: "날씨와 기분에 맞는 메뉴 추천"

---

## Phase 2: Firebase 설정

### 체크리스트
- [x] **2.1** Firebase 패키지 설치
- [x] **2.2** Firebase 초기화 코드 작성
- [x] **2.3** TypeScript 타입 정의
- [x] **2.4** Firestore 시드 스크립트 작성

### 2.1 Firebase 패키지 설치
```bash
npm install firebase@^12.0.0
```

> **Firebase SDK 12.x 주요 기능**: Firestore Pipelines, AbortSignal 지원

### 2.2 Firebase 초기화 (`src/lib/firebase.ts`)
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
```

### 2.3 TypeScript 타입 정의 (`src/types/index.ts`)
```typescript
// 날씨 태그 타입
export type WeatherTag = 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | 'Mist';

// 기분 태그 타입
export type MoodTag = 'stress' | 'tired' | 'happy' | 'sad' | 'normal';

// 메뉴 데이터 타입
export interface Menu {
  id: string;
  name: string;
  category: string;
  weather_tags: WeatherTag[];
  mood_tags: MoodTag[];
  image_url: string;
}

// 날씨 API 응답 타입
export interface WeatherData {
  weather: WeatherTag;
  description: string;
  temp: number;
  icon: string;
}

// 추천 결과 타입
export interface RecommendationResult {
  menu: Menu;
  reason: string;
  score: number;
}
```

### 2.4 초기 메뉴 데이터 (Firestore `menus` 컬렉션)

| name | category | weather_tags | mood_tags | image_url |
|------|----------|--------------|-----------|-----------|
| 마라탕 | 중식 | Rain, Clouds, Snow | stress, tired | /images/malatang.jpg |
| 삼겹살 | 한식 | Clear, Clouds | happy, stress | /images/samgyeopsal.jpg |
| 초밥 | 일식 | Clear, Clouds | happy, normal | /images/sushi.jpg |
| 된장찌개 | 한식 | Rain, Clouds, Snow | sad, tired, normal | /images/doenjangjjigae.jpg |
| 파스타 | 양식 | Clear, Clouds | happy, normal | /images/pasta.jpg |
| 떡볶이 | 분식 | Rain, Clouds, Snow | stress, sad | /images/tteokbokki.jpg |
| 치킨 | 양식 | Rain, Clear, Clouds | happy, stress, sad | /images/chicken.jpg |
| 냉면 | 한식 | Clear | tired, normal | /images/naengmyeon.jpg |
| 라멘 | 일식 | Rain, Clouds, Snow | tired, sad | /images/ramen.jpg |
| 샐러드 | 양식 | Clear | normal, happy | /images/salad.jpg |

---

## Phase 3: API Route 개발

### 체크리스트
- [x] **3.1** Weather API Route 구현 (`/api/weather`)
- [x] **3.2** Recommend API Route 구현 (`/api/recommend`)

### 3.1 Weather API (`src/app/api/weather/route.ts`)

**엔드포인트**: `GET /api/weather?lat={latitude}&lon={longitude}`

**구현 요구사항**:
- OpenWeatherMap API 호출 (서버사이드에서 API Key 사용)
- 응답에서 `weather[0].main`을 WeatherTag로 매핑
- 에러 핸들링 (API 실패, 잘못된 좌표 등)

**응답 형식**:
```json
{
  "weather": "Rain",
  "description": "light rain",
  "temp": 15,
  "icon": "10d"
}
```

**OpenWeatherMap API 호출**:
```
https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```

### 3.2 Recommend API (`src/app/api/recommend/route.ts`)

**엔드포인트**: `GET /api/recommend?weather={weather}&mood={mood}`

**구현 요구사항**:
- Firestore에서 메뉴 조회
- 추천 알고리즘 적용 (Phase 4에서 구현한 함수 사용)
- 추천 사유 생성

**응답 형식**:
```json
{
  "menu": {
    "id": "abc123",
    "name": "마라탕",
    "category": "중식",
    "image_url": "/images/malatang.jpg"
  },
  "reason": "비 오는 날엔 스트레스 풀리는 매운맛!",
  "score": 1.0
}
```

---

## Phase 4: 핵심 로직 개발

### 체크리스트
- [x] **4.1** 추천 알고리즘 구현
- [x] **4.2** Geolocation Hook 구현
- [x] **4.3** Weather Hook 구현

### 4.1 추천 알고리즘 (`src/lib/recommendation.ts`)

**가중치 점수 계산 공식**:
```
Score = (W × 0.4) + (M × 0.6)

W = 날씨 일치 여부 (0 또는 1)
M = 기분 일치 여부 (0 또는 1)
w_weather = 0.4 (날씨 가중치)
w_mood = 0.6 (기분 가중치) - 사용자 주관적 상태에 높은 우선순위
```

**구현해야 할 함수**:
```typescript
// 단일 메뉴 점수 계산
function calculateScore(menu: Menu, weather: WeatherTag, mood: MoodTag): number

// 최고 점수 메뉴 그룹 필터링
function filterTopScoreMenus(menus: Menu[], weather: WeatherTag, mood: MoodTag): Menu[]

// 최종 메뉴 선택 (무작위)
function selectRandomMenu(menus: Menu[]): Menu

// 추천 사유 생성
function generateReason(menu: Menu, weather: WeatherTag, mood: MoodTag): string
```

**추천 사유 템플릿 예시**:
- 비 + 스트레스: "{메뉴명}로 스트레스 확 풀어요!"
- 맑음 + 행복: "기분 좋은 날엔 {메뉴명} 어때요?"
- 흐림 + 피곤: "피곤할 땐 든든한 {메뉴명}!"

### 4.2 Geolocation Hook (`src/hooks/useGeolocation.ts`)

**구현 요구사항**:
- 브라우저 Geolocation API 사용
- 권한 거부 시 기본 좌표 반환 (서울: 37.5665, 126.9780)
- 로딩/에러 상태 관리

**반환 타입**:
```typescript
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}
```

### 4.3 Weather Hook (`src/hooks/useWeather.ts`)

**구현 요구사항**:
- useGeolocation 훅 사용
- `/api/weather` 호출
- 날씨 데이터 캐싱 (선택)

**반환 타입**:
```typescript
interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

---

## Phase 5: UI 컴포넌트 개발

### 체크리스트
- [x] **5.1** 글로벌 스타일 확장 (`globals.css` - Phase 1에서 기본 설정 완료)
- [x] **5.2** WeatherCard 컴포넌트
- [x] **5.3** MoodSelector 컴포넌트
- [x] **5.4** RecommendButton 컴포넌트
- [x] **5.5** ResultCard 컴포넌트

### 5.1 글로벌 스타일 확장 (Tailwind CSS v4)

**애니메이션 추가** (`src/app/globals.css`):
```css
@import "tailwindcss";

@theme {
  /* 컬러 (Phase 1에서 설정) */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-accent: #f59e0b;
  --color-mood-stress: #ef4444;
  --color-mood-tired: #8b5cf6;
  --color-mood-happy: #22c55e;
  --color-mood-sad: #6366f1;
  --color-mood-normal: #64748b;
  
  /* 애니메이션 */
  --animate-fade-in: fade-in 0.3s ease-out;
  --animate-slide-up: slide-up 0.3s ease-out;
  --animate-bounce-light: bounce-light 0.5s ease-in-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes bounce-light {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 5.2 WeatherCard 컴포넌트

**Props**:
```typescript
interface WeatherCardProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}
```

**표시 요소**:
- 날씨 아이콘 (OpenWeatherMap 아이콘 URL: `https://openweathermap.org/img/wn/{icon}@2x.png`)
- 현재 온도 (°C)
- 날씨 상태 (한글로 표시)
- 로딩 스켈레톤

**날씨 한글 매핑**:
| WeatherTag | 한글 |
|------------|------|
| Clear | 맑음 |
| Clouds | 흐림 |
| Rain | 비 |
| Snow | 눈 |
| Thunderstorm | 천둥번개 |
| Drizzle | 이슬비 |
| Mist | 안개 |

### 5.3 MoodSelector 컴포넌트

**Props**:
```typescript
interface MoodSelectorProps {
  selectedMood: MoodTag | null;
  onMoodSelect: (mood: MoodTag) => void;
}
```

**기분 옵션**:
| MoodTag | 이모지 | 라벨 |
|---------|--------|------|
| stress | 🔥 | 스트레스 |
| tired | 😴 | 피곤해 |
| happy | 🥳 | 신나! |
| sad | 😔 | 우울해 |
| normal | 🤔 | 그냥 그래 |

**스타일 요구사항**:
- 5개 버튼 가로 배치 (모바일: 그리드)
- 선택 시 하이라이트 효과
- 호버 애니메이션

### 5.4 RecommendButton 컴포넌트

**Props**:
```typescript
interface RecommendButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}
```

**스타일 요구사항**:
- 큰 CTA 버튼 스타일
- 로딩 시 스피너 표시
- disabled 상태 스타일

### 5.5 ResultCard 컴포넌트

**Props**:
```typescript
interface ResultCardProps {
  result: RecommendationResult | null;
  onRetry: () => void;
}
```

**표시 요소**:
- 메뉴 이미지 (Next.js Image 컴포넌트)
- 메뉴 이름
- 카테고리 뱃지
- 추천 사유
- "다시 추천받기" 버튼

**스타일 요구사항**:
- 카드 등장 애니메이션 (fade-in + slide-up)
- 이미지 비율 유지 (aspect-ratio)

---

## Phase 6: 메인 페이지 통합

### 체크리스트
- [x] **6.1** 메인 페이지 레이아웃 구성
- [x] **6.2** 상태 관리 로직 구현
- [x] **6.3** 컴포넌트 연결 및 이벤트 핸들링
- [x] **6.4** Local Storage 캐싱 구현

### 6.1 메인 페이지 레이아웃 (`src/app/page.tsx`)

**화면 구조**:
```
┌─────────────────────────────┐
│         헤더 (로고)          │
├─────────────────────────────┤
│       WeatherCard           │
├─────────────────────────────┤
│   "오늘 기분이 어때요?"       │
│       MoodSelector          │
├─────────────────────────────┤
│      RecommendButton        │
├─────────────────────────────┤
│        ResultCard           │
│    (추천 결과 있을 때만)      │
└─────────────────────────────┘
```

### 6.2 상태 관리

**필요한 상태**:
```typescript
const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null);
const [result, setResult] = useState<RecommendationResult | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 6.4 Local Storage 캐싱

**저장 항목**:
- `lastSelectedMood`: 마지막 선택 기분
- 페이지 로드 시 복원

---

## Phase 7: 스타일링 & UX 개선

### 체크리스트
- [ ] **7.1** 반응형 디자인 적용
- [ ] **7.2** 애니메이션 효과 추가
- [ ] **7.3** 로딩 스켈레톤 UI
- [ ] **7.4** 에러 상태 UI
- [ ] **7.5** 다크모드 지원 (선택)

### 7.1 반응형 브레이크포인트
- Mobile: < 640px
- Tablet: 640px ~ 1024px
- Desktop: > 1024px

### 7.2 애니메이션
- 결과 카드: fade-in + slide-up (0.3s)
- 버튼 호버: scale(1.05)
- 기분 선택: bounce effect

---

## Phase 8: 테스트 & 최적화

### 체크리스트
- [ ] **8.1** 기능 테스트
- [ ] **8.2** 엣지 케이스 처리
- [ ] **8.3** 성능 최적화

### 8.1 기능 테스트 시나리오
1. 위치 권한 허용 → 날씨 정상 표시
2. 위치 권한 거부 → 기본 위치(서울) 사용
3. 기분 선택 → 선택 상태 표시
4. 추천 버튼 클릭 → 결과 표시
5. 다시 추천 → 새 결과 표시
6. 새로고침 → 마지막 기분 복원

### 8.2 엣지 케이스
- 날씨 API 실패 시 → 에러 메시지 표시, 기분만으로 추천
- 매칭 메뉴 없음 → 랜덤 추천 + 안내 메시지
- 네트워크 오프라인 → 오프라인 안내

---

## Phase 9: 배포

### 체크리스트
- [ ] **9.1** Firebase 프로젝트 설정
- [ ] **9.2** Firestore에 초기 데이터 입력
- [ ] **9.3** Vercel 프로젝트 연결
- [ ] **9.4** 환경 변수 설정
- [ ] **9.5** 프로덕션 배포
- [ ] **9.6** 배포 후 테스트

### 9.1 Firebase 프로젝트 설정
1. [Firebase Console](https://console.firebase.google.com) 접속
2. 새 프로젝트 생성
3. Firestore Database 활성화 (테스트 모드)
4. 웹 앱 추가 → 설정 값 복사

### 9.3 Vercel 배포
```bash
npm install -g vercel
vercel
```

### 9.4 Vercel 환경 변수
Vercel Dashboard → Settings → Environment Variables에서 모든 환경 변수 설정

---

## 📝 변경 이력

| 날짜 | 변경 내용 | 작업자 |
|------|----------|--------|
| 2026-01-29 | 기술 스택 업데이트: Next.js 16.x, Tailwind CSS 4.x, Firebase 12.x | Agent |
| 2026-01-29 | 최초 작성 | Agent |

---

## 🔗 참고 문서

- [PRD.md](./PRD.md) - 상세 기획 문서
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
