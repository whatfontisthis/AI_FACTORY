# CineLog - Master Development Plan
> 에이전트 오케스트레이션을 위한 단일 마스터 문서  
> 이 문서 하나만으로 전체 프로젝트를 구현할 수 있도록 모든 컨텍스트를 포함합니다.

---

## 📋 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 상세](#2-기술-스택-상세)
3. [디자인 시스템](#3-디자인-시스템)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [데이터베이스 스키마](#5-데이터베이스-스키마)
6. [API 설계](#6-api-설계)
7. [컴포넌트 명세](#7-컴포넌트-명세)
8. [Phase별 구현 가이드](#8-phase별-구현-가이드)
9. [환경 변수 설정](#9-환경-변수-설정)
10. [배포 가이드](#10-배포-가이드)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정의
- **이름**: CineLog (개인용 영화 리뷰 아카이브)
- **목적**: TMDB API를 활용한 1인용 비공개 영화 기록 서비스
- **특징**: 로그인 없음, 단일 사용자, 즉시 기록 가능

### 1.2 핵심 기능
| 기능 | 설명 |
|------|------|
| 영화 검색 | TMDB API로 영화 제목 검색, 자동완성 |
| 리뷰 작성 | 감상평, 별점(1-5), 시청일 입력 |
| 대시보드 | 모든 리뷰 그리드 뷰, Top Ranking 자동 노출 |
| 필터링 | 별점 기반 필터, 제목 검색 |
| 상세 보기 | Modal로 영화 정보 + 내 리뷰 확인 |

### 1.3 비기능 요구사항
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 이미지 최적화 로딩 (Next/Image)
- 빠른 초기 로딩 (SSR/SSG 활용)

---

## 2. 기술 스택 상세

### 2.1 프레임워크 & 런타임
```
Node.js: 22.x LTS (권장) 또는 24.x LTS
Next.js: 16.x (App Router, Turbopack 기본)
React: 19.x
TypeScript: 5.9.x
```

**Next.js 16 주요 특징:**
- Turbopack 기본 번들러 (5-10x 빠른 Fast Refresh)
- `"use cache"` 지시어를 통한 Cache Components
- React Compiler 지원 (자동 메모이제이션)
- React 19.2 지원 (View Transitions, 새로운 hooks)

### 2.2 스타일링
```
Tailwind CSS: 4.x (CSS-first 설정)
shadcn/ui: 3.7.x
lucide-react: 0.563.x (아이콘 라이브러리)
```

**Tailwind CSS v4 주요 변경사항:**
- `tailwind.config.ts` 파일 불필요 → CSS에서 직접 설정
- 빌드 속도 5x 향상, 증분 빌드 100x 향상
- Cascade layers, `color-mix()` 등 최신 CSS 기능 활용
- 템플릿 파일 자동 감지 (content 설정 불필요)

### 2.3 데이터베이스
```
MongoDB Atlas: 무료 티어 (M0 Sandbox)
mongoose: 9.x (ODM, TypeScript 빌트인 지원 강화)
```

### 2.4 외부 API
```
TMDB API v3
Base URL: https://api.themoviedb.org/3
Image Base URL: https://image.tmdb.org/t/p/
```

### 2.5 유틸리티 라이브러리
```
date-fns: 4.x (타임존 지원 내장)
```

### 2.6 패키지 설치 명령어
```bash
# 프로젝트 생성 (Next.js 16 + Turbopack + Tailwind v4)
npx create-next-app@latest cinelog --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"

# 의존성 설치
npm install mongoose lucide-react date-fns

# shadcn/ui 초기화 (Tailwind v4 호환)
npx shadcn@latest init

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add button card dialog input label textarea badge select skeleton sonner
```

### 2.7 버전 호환성 매트릭스
| 패키지 | 버전 | 비고 |
|--------|------|------|
| Node.js | ≥22.0.0 | LTS 권장 |
| Next.js | ^16.1.0 | App Router 필수 |
| React | ^19.0.0 | Next.js 16과 호환 |
| TypeScript | ^5.9.0 | strict 모드 권장 |
| Tailwind CSS | ^4.1.0 | CSS-first 설정 |
| mongoose | ^9.0.0 | MongoDB 6.0+ 권장 |
| shadcn/ui | ^3.7.0 | CLI로 설치 |
| lucide-react | ^0.563.0 | 최신 아이콘 |
| date-fns | ^4.1.0 | 타임존 지원 |

---

## 3. 디자인 시스템

### 3.1 색상 팔레트 (다크 테마 기반)

```css
/* 메인 컬러 */
--primary: #E50914;           /* Netflix Red - 강조, 별점, CTA 버튼 */
--primary-hover: #F40612;     /* 호버 상태 */

/* 배경 컬러 */
--background: #141414;        /* 메인 배경 */
--background-card: #1F1F1F;   /* 카드 배경 */
--background-elevated: #2A2A2A; /* 모달, 드롭다운 배경 */

/* 텍스트 컬러 */
--text-primary: #FFFFFF;      /* 주요 텍스트 */
--text-secondary: #A3A3A3;    /* 보조 텍스트 */
--text-muted: #6B6B6B;        /* 비활성 텍스트 */

/* 보더 & 구분선 */
--border: #333333;            /* 기본 보더 */
--border-hover: #525252;      /* 호버 보더 */

/* 별점 컬러 */
--star-filled: #FBBF24;       /* 채워진 별 (Amber-400) */
--star-empty: #4B5563;        /* 빈 별 (Gray-600) */

/* 상태 컬러 */
--success: #22C55E;           /* 성공 */
--error: #EF4444;             /* 에러 */
```

### 3.2 Tailwind CSS v4 설정 (CSS-first 방식)

**Tailwind v4에서는 `tailwind.config.ts` 파일 대신 `globals.css`에서 직접 설정합니다.**

#### postcss.config.mjs
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

#### src/app/globals.css (전체 설정)
```css
@import "tailwindcss";

/* ============================================
   CineLog 커스텀 테마 설정 (Tailwind v4)
   ============================================ */

@theme {
  /* 폰트 패밀리 */
  --font-sans: "Pretendard Variable", system-ui, sans-serif;

  /* 메인 컬러 */
  --color-primary: #E50914;
  --color-primary-hover: #F40612;

  /* 배경 컬러 */
  --color-background: #141414;
  --color-background-card: #1F1F1F;
  --color-background-elevated: #2A2A2A;

  /* 텍스트 컬러 */
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A3A3A3;
  --color-text-muted: #6B6B6B;

  /* 보더 컬러 */
  --color-border: #333333;
  --color-border-hover: #525252;

  /* 별점 컬러 */
  --color-star-filled: #FBBF24;
  --color-star-empty: #4B5563;

  /* 상태 컬러 */
  --color-success: #22C55E;
  --color-error: #EF4444;

  /* 애니메이션 */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
}

/* 커스텀 키프레임 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* 기본 스타일 */
body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

/* 다크 모드 기본 적용 */
:root {
  color-scheme: dark;
}
```

#### Tailwind v4 사용 예시
```tsx
// 커스텀 색상 사용
<div className="bg-background text-text-primary">
  <button className="bg-primary hover:bg-primary-hover">
    저장
  </button>
  <div className="border border-border hover:border-border-hover">
    카드
  </div>
  <span className="text-star-filled">★</span>
</div>
```

### 3.3 타이포그래피
```css
/* 제목 */
.text-title-lg { font-size: 2rem; font-weight: 700; line-height: 1.2; }    /* 32px - 페이지 제목 */
.text-title-md { font-size: 1.5rem; font-weight: 600; line-height: 1.3; }  /* 24px - 섹션 제목 */
.text-title-sm { font-size: 1.125rem; font-weight: 600; line-height: 1.4; } /* 18px - 카드 제목 */

/* 본문 */
.text-body { font-size: 1rem; font-weight: 400; line-height: 1.6; }        /* 16px - 기본 */
.text-body-sm { font-size: 0.875rem; font-weight: 400; line-height: 1.5; } /* 14px - 보조 */
.text-caption { font-size: 0.75rem; font-weight: 400; line-height: 1.4; }  /* 12px - 캡션 */
```

### 3.4 그리드 레이아웃
```css
/* 리뷰 카드 그리드 */
.review-grid {
  display: grid;
  gap: 1.5rem; /* 24px */
  grid-template-columns: repeat(2, 1fr);   /* 모바일: 2열 */
}

@media (min-width: 768px) {
  .review-grid { grid-template-columns: repeat(3, 1fr); } /* 태블릿: 3열 */
}

@media (min-width: 1024px) {
  .review-grid { grid-template-columns: repeat(4, 1fr); } /* 데스크톱: 4열 */
}

@media (min-width: 1280px) {
  .review-grid { grid-template-columns: repeat(5, 1fr); } /* 대형: 5열 */
}
```

### 3.5 카드 스타일 명세
```
리뷰 카드 (ReviewCard):
- 크기: 가변 (그리드에 따름)
- 포스터 비율: 2:3 (aspect-[2/3])
- 모서리: rounded-lg (8px)
- 그림자: shadow-lg
- 호버 효과: scale(1.03), shadow-xl, 0.2s transition
- 하단 정보: 제목(1줄 말줄임), 별점, 시청일
```

---

## 4. 프로젝트 구조

```
cinelog/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 루트 레이아웃 (다크 테마, 폰트)
│   │   ├── page.tsx                # 메인 대시보드 페이지
│   │   ├── globals.css             # 전역 스타일
│   │   └── api/
│   │       ├── movies/
│   │       │   └── search/
│   │       │       └── route.ts    # TMDB 영화 검색 API
│   │       └── reviews/
│   │           ├── route.ts        # GET(목록), POST(생성)
│   │           └── [id]/
│   │               └── route.ts    # GET(상세), PUT(수정), DELETE(삭제)
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 컴포넌트 (자동 생성)
│   │   ├── layout/
│   │   │   └── Header.tsx          # 상단 헤더 (로고, 새 리뷰 버튼)
│   │   ├── review/
│   │   │   ├── ReviewCard.tsx      # 리뷰 카드 컴포넌트
│   │   │   ├── ReviewGrid.tsx      # 리뷰 그리드 컨테이너
│   │   │   ├── ReviewModal.tsx     # 리뷰 상세 보기 모달
│   │   │   ├── ReviewForm.tsx      # 리뷰 작성/수정 폼
│   │   │   └── StarRating.tsx      # 별점 입력/표시 컴포넌트
│   │   ├── movie/
│   │   │   ├── MovieSearch.tsx     # 영화 검색 입력 + 자동완성
│   │   │   └── MovieCard.tsx       # 검색 결과 영화 카드
│   │   ├── filter/
│   │   │   ├── SearchBar.tsx       # 제목 검색 바
│   │   │   └── RatingFilter.tsx    # 별점 필터 버튼 그룹
│   │   └── dashboard/
│   │       └── TopRanking.tsx      # 상단 Top Ranking 섹션
│   │
│   ├── lib/
│   │   ├── db.ts                   # MongoDB 연결 유틸
│   │   ├── tmdb.ts                 # TMDB API 유틸 함수
│   │   └── utils.ts                # 공통 유틸 (cn 함수 등)
│   │
│   ├── models/
│   │   └── Review.ts               # Mongoose 리뷰 스키마
│   │
│   └── types/
│       ├── movie.ts                # TMDB 영화 타입
│       └── review.ts               # 리뷰 타입
│
├── public/
│   └── placeholder-poster.png      # 포스터 없을 때 대체 이미지
│
├── .env.local                      # 환경 변수 (gitignore)
├── next.config.js                  # Next.js 설정 (이미지 도메인)
├── tailwind.config.ts              # Tailwind 설정
├── tsconfig.json                   # TypeScript 설정
└── package.json
```

---

## 5. 데이터베이스 스키마

### 5.1 MongoDB 연결 설정 (src/lib/db.ts)
```typescript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경 변수를 설정해주세요.');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
```

### 5.2 리뷰 스키마 (src/models/Review.ts)
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  movieId: string;        // TMDB 영화 ID
  title: string;          // 영화 제목
  originalTitle: string;  // 원제
  posterPath: string;     // 포스터 경로 (/xxx.jpg)
  description: string;    // 줄거리
  releaseDate: string;    // 개봉일
  genres: string[];       // 장르 배열
  userReview: string;     // 내 감상평
  rating: number;         // 별점 (1-5)
  watchedAt: Date;        // 시청일
  createdAt: Date;        // 생성일
  updatedAt: Date;        // 수정일
}

const ReviewSchema = new Schema<IReview>(
  {
    movieId: { type: String, required: true },
    title: { type: String, required: true },
    originalTitle: { type: String, default: '' },
    posterPath: { type: String, default: '' },
    description: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
    genres: [{ type: String }],
    userReview: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    watchedAt: { type: Date, required: true },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 인덱스 설정
ReviewSchema.index({ rating: -1 }); // 별점 내림차순 정렬용
ReviewSchema.index({ title: 'text' }); // 제목 텍스트 검색용
ReviewSchema.index({ watchedAt: -1 }); // 시청일 정렬용

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
```

### 5.3 타입 정의 (src/types/review.ts)
```typescript
export interface ReviewData {
  _id: string;
  movieId: string;
  title: string;
  originalTitle: string;
  posterPath: string;
  description: string;
  releaseDate: string;
  genres: string[];
  userReview: string;
  rating: number;
  watchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewInput {
  movieId: string;
  title: string;
  originalTitle?: string;
  posterPath?: string;
  description?: string;
  releaseDate?: string;
  genres?: string[];
  userReview: string;
  rating: number;
  watchedAt: string;
}

export interface UpdateReviewInput {
  userReview?: string;
  rating?: number;
  watchedAt?: string;
}
```

---

## 6. API 설계

### 6.1 TMDB 영화 검색 API

**엔드포인트**: `GET /api/movies/search?query={검색어}&page={페이지}`

**src/lib/tmdb.ts**:
```typescript
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export async function searchMovies(query: string, page = 1): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`,
    { next: { revalidate: 3600 } } // 1시간 캐시
  );
  
  if (!response.ok) {
    throw new Error('TMDB API 요청 실패');
  }
  
  return response.json();
}

export async function getMovieDetails(movieId: number) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR`,
    { next: { revalidate: 86400 } } // 24시간 캐시
  );
  
  if (!response.ok) {
    throw new Error('영화 상세 정보 조회 실패');
  }
  
  return response.json();
}

// 포스터 URL 생성 헬퍼
export function getPosterUrl(posterPath: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342') {
  if (!posterPath) return '/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}
```

**src/app/api/movies/search/route.ts**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { searchMovies } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const page = parseInt(searchParams.get('page') || '1');

  if (!query) {
    return NextResponse.json({ error: '검색어를 입력해주세요.' }, { status: 400 });
  }

  try {
    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '영화 검색에 실패했습니다.' }, { status: 500 });
  }
}
```

### 6.2 리뷰 CRUD API

**GET /api/reviews** - 리뷰 목록 조회
```
Query Parameters:
- rating: 별점 필터 (1-5)
- search: 제목 검색어
- sort: 정렬 기준 (rating | watchedAt | createdAt)
- order: 정렬 순서 (asc | desc)
- page: 페이지 번호 (기본값: 1)
- limit: 페이지당 개수 (기본값: 20)

Response:
{
  "reviews": ReviewData[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

**POST /api/reviews** - 리뷰 생성
```
Request Body: CreateReviewInput
Response: { "review": ReviewData }
```

**GET /api/reviews/[id]** - 리뷰 상세 조회
```
Response: { "review": ReviewData }
```

**PUT /api/reviews/[id]** - 리뷰 수정
```
Request Body: UpdateReviewInput
Response: { "review": ReviewData }
```

**DELETE /api/reviews/[id]** - 리뷰 삭제
```
Response: { "message": "리뷰가 삭제되었습니다." }
```

**src/app/api/reviews/route.ts**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

// GET: 리뷰 목록 조회
export async function GET(request: NextRequest) {
  await dbConnect();
  
  const searchParams = request.nextUrl.searchParams;
  const rating = searchParams.get('rating');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  // 필터 조건 구성
  const filter: any = {};
  if (rating) filter.rating = parseInt(rating);
  if (search) filter.title = { $regex: search, $options: 'i' };

  // 정렬 조건
  const sortOption: any = {};
  sortOption[sort] = order === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  return NextResponse.json({
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST: 리뷰 생성
export async function POST(request: NextRequest) {
  await dbConnect();
  
  const body = await request.json();
  
  // 필수 필드 검증
  if (!body.movieId || !body.title || !body.userReview || !body.rating || !body.watchedAt) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
  }

  // 별점 범위 검증
  if (body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: '별점은 1~5 사이여야 합니다.' }, { status: 400 });
  }

  const review = await Review.create(body);
  return NextResponse.json({ review }, { status: 201 });
}
```

**src/app/api/reviews/[id]/route.ts**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

// GET: 리뷰 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  const review = await Review.findById(params.id).lean();
  
  if (!review) {
    return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
  }
  
  return NextResponse.json({ review });
}

// PUT: 리뷰 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  const body = await request.json();
  
  const review = await Review.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true, runValidators: true }
  ).lean();
  
  if (!review) {
    return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
  }
  
  return NextResponse.json({ review });
}

// DELETE: 리뷰 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  const review = await Review.findByIdAndDelete(params.id);
  
  if (!review) {
    return NextResponse.json({ error: '리뷰를 찾을 수 없습니다.' }, { status: 404 });
  }
  
  return NextResponse.json({ message: '리뷰가 삭제되었습니다.' });
}
```

---

## 7. 컴포넌트 명세

### 7.1 StarRating 컴포넌트
```typescript
// src/components/review/StarRating.tsx
interface StarRatingProps {
  rating: number;           // 현재 별점 (1-5)
  onChange?: (rating: number) => void;  // 변경 핸들러 (없으면 읽기 전용)
  size?: 'sm' | 'md' | 'lg'; // 크기 (sm: 16px, md: 20px, lg: 24px)
}

// 구현 포인트:
// - lucide-react의 Star 아이콘 사용
// - 채워진 별: fill="currentColor" className="text-star-filled"
// - 빈 별: className="text-star-empty"
// - hover 시 미리보기 효과 (onChange 있을 때만)
// - 클릭 시 해당 별점으로 설정
```

### 7.2 ReviewCard 컴포넌트
```typescript
// src/components/review/ReviewCard.tsx
interface ReviewCardProps {
  review: ReviewData;
  onClick: () => void;  // 카드 클릭 시 모달 열기
}

// 레이아웃:
// ┌─────────────────┐
// │                 │
// │    [포스터]     │  <- aspect-[2/3], object-cover
// │                 │
// ├─────────────────┤
// │ 영화 제목       │  <- 1줄, truncate
// │ ★★★★☆  4.0    │  <- StarRating (sm) + 숫자
// │ 2024.01.15     │  <- 시청일 (text-muted)
// └─────────────────┘

// 호버 효과:
// - transform: scale(1.03)
// - shadow 증가
// - transition: all 0.2s ease
```

### 7.3 ReviewModal 컴포넌트
```typescript
// src/components/review/ReviewModal.tsx
interface ReviewModalProps {
  review: ReviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// 레이아웃 (Desktop):
// ┌────────────────────────────────────────┐
// │  [X]                                   │
// │ ┌──────┐  영화 제목 (Original Title)   │
// │ │포스터│  ★★★★☆ 4.0                  │
// │ │      │  개봉일: 2024.03.15           │
// │ │      │  장르: 드라마, 스릴러          │
// │ └──────┘  시청일: 2024.01.20           │
// │                                        │
// │ [줄거리]                               │
// │ Lorem ipsum dolor sit amet...          │
// │                                        │
// │ [내 감상평]                            │
// │ 이 영화는 정말 인상적이었다...          │
// │                                        │
// │        [수정]  [삭제]                  │
// └────────────────────────────────────────┘

// shadcn/ui Dialog 사용
// 최대 너비: max-w-2xl (672px)
// 모바일: 세로 스택 레이아웃
```

### 7.4 ReviewForm 컴포넌트
```typescript
// src/components/review/ReviewForm.tsx
interface ReviewFormProps {
  movie?: TMDBMovie;        // 선택된 영화 (신규 작성 시)
  review?: ReviewData;      // 기존 리뷰 (수정 시)
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;     // 저장 완료 후 콜백
}

// 폼 필드:
// 1. 영화 검색 (MovieSearch) - 신규 작성 시만 표시
// 2. 선택된 영화 정보 표시 (포스터 + 제목)
// 3. 별점 입력 (StarRating)
// 4. 시청일 입력 (date input)
// 5. 감상평 입력 (textarea)
// 6. 저장/취소 버튼
```

### 7.5 MovieSearch 컴포넌트
```typescript
// src/components/movie/MovieSearch.tsx
interface MovieSearchProps {
  onSelect: (movie: TMDBMovie) => void;
}

// 기능:
// - 입력 디바운싱 (300ms)
// - 입력 중 로딩 스피너
// - 검색 결과 드롭다운 리스트
// - 포스터 썸네일 + 제목 + 개봉년도 표시
// - 클릭 시 onSelect 호출
// - 외부 클릭 시 드롭다운 닫기
```

### 7.6 TopRanking 컴포넌트
```typescript
// src/components/dashboard/TopRanking.tsx
// 별점 4점 이상 리뷰를 최신순으로 5개까지 표시

// 레이아웃:
// ┌────────────────────────────────────────────────┐
// │ 🏆 Top Ranking                                 │
// │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
// │ │    │ │    │ │    │ │    │ │    │           │
// │ └────┘ └────┘ └────┘ └────┘ └────┘           │
// │ 영화1   영화2   영화3   영화4   영화5          │
// └────────────────────────────────────────────────┘

// 가로 스크롤 (모바일) 또는 flex wrap (데스크톱)
// 별점 4점 이상만 필터링
// 최대 5개 표시
```

### 7.7 SearchBar & RatingFilter 컴포넌트
```typescript
// src/components/filter/SearchBar.tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}
// - Input with Search 아이콘
// - placeholder: "영화 제목으로 검색..."
// - 디바운싱 적용 (300ms)

// src/components/filter/RatingFilter.tsx
interface RatingFilterProps {
  selectedRating: number | null;
  onChange: (rating: number | null) => void;
}
// - 버튼 그룹: [전체] [★5] [★4] [★3] [★2] [★1]
// - 선택된 버튼 강조 (primary 색상)
// - 같은 버튼 다시 클릭 시 필터 해제 (null)
```

---

## 8. Phase별 구현 가이드

### Phase 1: 프로젝트 초기 설정 & TMDB 연동

#### 1.1 프로젝트 생성 (Next.js 16 + Turbopack)
```bash
# Next.js 16 프로젝트 생성 (Turbopack 기본 활성화)
npx create-next-app@latest cinelog --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
cd cinelog
```

#### 1.2 의존성 설치
```bash
# 핵심 의존성
npm install mongoose lucide-react date-fns

# shadcn/ui 초기화 (Tailwind v4 호환)
npx shadcn@latest init
# 프롬프트 응답:
#   - Style: Default
#   - Base color: Neutral (또는 Slate)
#   - CSS variables: Yes

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add button card dialog input label textarea badge select skeleton sonner
```

#### 1.3 환경 변수 설정
`.env.local` 파일 생성:
```env
TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinelog?retryWrites=true&w=majority
```

#### 1.4 PostCSS 설정 (Tailwind v4)
`postcss.config.mjs`:
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

#### 1.5 Next.js 설정
`next.config.ts` (Next.js 16은 TypeScript 설정 파일 권장):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  // Next.js 16 - Turbopack이 기본값이므로 별도 설정 불필요
  // experimental 옵션 필요시 여기에 추가
};

export default nextConfig;
```

#### 1.6 글로벌 CSS 설정 (Tailwind v4)
`src/app/globals.css` - 섹션 3.2의 전체 CSS 코드 적용

#### 1.7 구현 순서
1. `src/lib/tmdb.ts` - TMDB API 유틸 함수
2. `src/types/movie.ts` - TMDB 응답 타입
3. `src/app/api/movies/search/route.ts` - 영화 검색 API
4. `src/components/movie/MovieSearch.tsx` - 영화 검색 컴포넌트
5. 테스트: 영화 검색 기능 동작 확인 (`npm run dev`로 Turbopack 개발 서버 실행)

---

### Phase 2: MongoDB 연결 & 리뷰 CRUD

#### 2.1 MongoDB Atlas 설정
1. https://cloud.mongodb.com 접속
2. 무료 클러스터 생성 (M0 Sandbox)
3. Database Access에서 사용자 생성
4. Network Access에서 IP 허용 (0.0.0.0/0 또는 특정 IP)
5. Connect > Drivers > 연결 문자열 복사

#### 2.2 구현 순서
1. `src/lib/db.ts` - MongoDB 연결 유틸
2. `src/models/Review.ts` - Mongoose 스키마
3. `src/types/review.ts` - 리뷰 타입 정의
4. `src/app/api/reviews/route.ts` - 목록 조회, 생성 API
5. `src/app/api/reviews/[id]/route.ts` - 상세, 수정, 삭제 API
6. 테스트: Postman/Thunder Client로 CRUD 테스트

---

### Phase 3: UI 컴포넌트 & 메인 페이지

#### 3.1 전역 스타일 설정
`src/app/globals.css` - **섹션 3.2의 전체 코드를 적용** (Tailwind v4 CSS-first 설정):
```css
@import "tailwindcss";

@theme {
  /* 섹션 3.2의 @theme 블록 전체 적용 */
  --color-primary: #E50914;
  --color-background: #141414;
  /* ... 나머지 커스텀 변수들 ... */
}

body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

:root {
  color-scheme: dark;
}
```

> **중요**: Tailwind v4에서는 `@tailwind base/components/utilities` 대신 `@import "tailwindcss";`를 사용합니다.

#### 3.2 구현 순서 (컴포넌트)
1. `src/components/review/StarRating.tsx`
2. `src/components/review/ReviewCard.tsx`
3. `src/components/review/ReviewGrid.tsx`
4. `src/components/review/ReviewModal.tsx`
5. `src/components/review/ReviewForm.tsx`
6. `src/components/dashboard/TopRanking.tsx`
7. `src/components/filter/SearchBar.tsx`
8. `src/components/filter/RatingFilter.tsx`
9. `src/components/layout/Header.tsx`

#### 3.3 메인 페이지 구현
`src/app/page.tsx`:
```typescript
// 페이지 레이아웃:
// ┌────────────────────────────────────────────────┐
// │ [Header: CineLog 로고 + 새 리뷰 작성 버튼]     │
// ├────────────────────────────────────────────────┤
// │ [TopRanking: 별점 4점 이상 영화 가로 스크롤]   │
// ├────────────────────────────────────────────────┤
// │ [FilterBar: 검색창 + 별점 필터]               │
// ├────────────────────────────────────────────────┤
// │ [ReviewGrid: 리뷰 카드 그리드]                │
// │ ┌────┐ ┌────┐ ┌────┐ ┌────┐                   │
// │ │    │ │    │ │    │ │    │                   │
// │ └────┘ └────┘ └────┘ └────┘                   │
// │   ...                                         │
// └────────────────────────────────────────────────┘

// 상태 관리:
// - reviews: ReviewData[]
// - selectedRating: number | null
// - searchQuery: string
// - isFormOpen: boolean
// - isModalOpen: boolean
// - selectedReview: ReviewData | null
```

#### 3.4 기능 연결
1. 새 리뷰 작성 플로우: 버튼 → MovieSearch → ReviewForm → POST API → 목록 새로고침
2. 리뷰 상세 보기: 카드 클릭 → ReviewModal 열기
3. 리뷰 수정: 모달 수정 버튼 → ReviewForm (기존 데이터) → PUT API
4. 리뷰 삭제: 모달 삭제 버튼 → 확인 → DELETE API → 목록 새로고침
5. 필터링: 별점 필터/검색어 → API 재호출 → 그리드 업데이트

---

### Phase 4: 배포 & 최적화

#### 4.1 Vercel 배포 전 체크리스트
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] 빌드 에러 없이 `npm run build` 성공
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고/에러 수정

#### 4.2 Vercel 배포
```bash
# Vercel CLI 설치 (선택)
npm i -g vercel

# 배포
vercel
# 또는 GitHub 연동 후 자동 배포
```

#### 4.3 환경 변수 설정 (Vercel Dashboard)
1. Project Settings > Environment Variables
2. 추가:
   - `TMDB_API_KEY`: TMDB API 키
   - `MONGODB_URI`: MongoDB Atlas 연결 문자열

#### 4.4 성능 최적화 체크리스트
- [ ] 이미지 최적화 (Next/Image, 적절한 size 사용)
- [ ] API 응답 캐싱 적용
- [ ] Skeleton UI로 로딩 상태 표시
- [ ] 무한 스크롤 또는 페이지네이션 적용 (리뷰가 많아질 경우)

---

## 9. 환경 변수 설정

### 9.1 개발 환경 (.env.local)
```env
# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cinelog?retryWrites=true&w=majority
```

### 9.2 TMDB API 키 발급
1. https://www.themoviedb.org 회원가입
2. Settings > API > Request an API Key
3. Developer 선택 > 정보 입력
4. API Key (v3 auth) 복사

### 9.3 MongoDB Atlas 설정
1. https://cloud.mongodb.com 회원가입
2. Build a Cluster > Shared (Free) 선택
3. 클러스터 생성 완료 후:
   - Security > Database Access > Add New Database User
   - Security > Network Access > Add IP Address (0.0.0.0/0 for development)
4. Clusters > Connect > Connect your application
5. 연결 문자열 복사 (password 부분 실제 비밀번호로 교체)

---

## 10. 배포 가이드

### 10.1 GitHub 저장소 생성
```bash
git init
git add .
git commit -m "Initial commit: CineLog project setup"
git branch -M main
git remote add origin https://github.com/username/cinelog.git
git push -u origin main
```

### 10.2 Vercel 배포
1. https://vercel.com 로그인 (GitHub 계정 연동)
2. Add New Project > Import Git Repository
3. cinelog 저장소 선택
4. Framework Preset: Next.js (자동 감지)
5. Environment Variables 설정:
   - `TMDB_API_KEY`
   - `MONGODB_URI`
6. Deploy 클릭

### 10.3 배포 후 확인
- [ ] 메인 페이지 로딩 확인
- [ ] 영화 검색 동작 확인
- [ ] 리뷰 CRUD 동작 확인
- [ ] 모바일 반응형 확인

---

## 📝 추가 참고 사항

### TMDB API 주요 엔드포인트
```
영화 검색: GET /search/movie?query={검색어}&language=ko-KR
영화 상세: GET /movie/{movie_id}?language=ko-KR
장르 목록: GET /genre/movie/list?language=ko-KR
인기 영화: GET /movie/popular?language=ko-KR
```

### 포스터 이미지 크기
```
w92    - 썸네일
w154   - 작은 썸네일
w185   - 검색 결과용
w342   - 카드용 (권장)
w500   - 상세 페이지용
w780   - 큰 이미지
original - 원본
```

### 에러 처리 가이드
```typescript
// API 에러 응답 형식 통일
interface ApiError {
  error: string;
  code?: string;
}

// 클라이언트 에러 처리
try {
  const response = await fetch('/api/reviews');
  if (!response.ok) {
    const { error } = await response.json();
    toast.error(error);
    return;
  }
  const data = await response.json();
} catch (error) {
  toast.error('네트워크 오류가 발생했습니다.');
}
```

---

## ✅ 완료 체크리스트

### Phase 1
- [ ] 프로젝트 초기 설정 완료
- [ ] 환경 변수 설정 완료
- [ ] TMDB API 연동 완료
- [ ] 영화 검색 기능 테스트 완료

### Phase 2
- [ ] MongoDB Atlas 연결 완료
- [ ] Review 스키마 정의 완료
- [ ] 리뷰 CRUD API 구현 완료
- [ ] API 테스트 완료

### Phase 3
- [ ] UI 컴포넌트 구현 완료
- [ ] 메인 대시보드 구현 완료
- [ ] 리뷰 작성/수정/삭제 기능 완료
- [ ] 검색 및 필터링 기능 완료

### Phase 4
- [ ] Vercel 배포 완료
- [ ] 환경 변수 설정 완료
- [ ] 전체 기능 테스트 완료
- [ ] 성능 최적화 완료

---

> **마지막 업데이트**: 2026-01-29  
> **문서 버전**: 1.0.0
