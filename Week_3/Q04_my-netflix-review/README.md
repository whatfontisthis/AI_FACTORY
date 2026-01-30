# CineLog

> 나만의 영화 리뷰 아카이브 | Personal Movie Review Archive

CineLog은 TMDB API를 활용한 개인용 영화 기록 서비스입니다. 로그인 없이 바로 사용할 수 있습니다.

CineLog is a personal movie review archive service powered by TMDB API. No login required.

![CineLog](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=tailwind-css)

---

## Features / 기능

- **영화 검색** - TMDB API를 통한 실시간 영화 검색 (Movie search via TMDB API)
- **리뷰 작성** - 감상평, 별점(1-5점), 시청일 기록 (Write reviews with ratings and watch date)
- **대시보드** - 모든 리뷰 그리드 뷰 + Top Ranking (Dashboard with grid view and top rankings)
- **필터링** - 별점/제목으로 리뷰 필터링 (Filter by rating or title)
- **상세 보기** - 모달로 영화 정보와 리뷰 확인 (View details in modal)
- **반응형 디자인** - 모바일/태블릿/데스크톱 지원 (Responsive design)

---

## Tech Stack / 기술 스택

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5.9 |
| **Styling** | Tailwind CSS 4.x + shadcn/ui |
| **Database** | MongoDB Atlas (Free Tier) |
| **External API** | TMDB API v3 |
| **Icons** | lucide-react |
| **Date Utils** | date-fns |
| **Deployment** | Vercel |

---

## Quick Start / 빠른 시작

### Prerequisites / 사전 요구사항

1. **Node.js** 22.x LTS or later
2. **TMDB API Key** - Get free at https://www.themoviedb.org/settings/api
3. **MongoDB Atlas** - Free account at https://cloud.mongodb.com

### Setup / 설정

#### 1. Clone or Download / 복제 또는 다운로드

```bash
# If you have this project as a zip, extract it
# If you have git:
git clone <repository-url>
cd cinelog
```

#### 2. Install Dependencies / 의존성 설치

```bash
npm install
```

#### 3. Configure Environment Variables / 환경 변수 설정

Create `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:

```env
TMDB_API_KEY=your_tmdb_api_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinelog?retryWrites=true&w=majority
```

> **Important**: Get your credentials by following [docs/SETUP_EXTERNAL_SERVICES.md](./docs/SETUP_EXTERNAL_SERVICES.md)

#### 4. Run Development Server / 개발 서버 실행

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Setup Guides / 설정 가이드

### External Services Setup / 외부 서비스 설정

Before running CineLog, you need to set up external services:

📖 **[Detailed Setup Guide →](./docs/SETUP_EXTERNAL_SERVICES.md)**

This guide covers:
1. TMDB API Key signup (5 minutes)
2. MongoDB Atlas setup (10 minutes)

### Deployment Guide / 배포 가이드

📖 **[Deployment Guide →](./docs/DEPLOYMENT.md)**

Deploy to Vercel in 5 minutes:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

---

## Project Structure / 프로젝트 구조

```
cinelog/
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   ├── movies/       # TMDB movie search API
│   │   │   └── reviews/      # Review CRUD API
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main dashboard
│   │   └── globals.css       # Global styles
│   │
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── filter/           # Search & filter components
│   │   ├── layout/           # Header, footer
│   │   ├── movie/            # Movie search components
│   │   └── review/           # Review components
│   │
│   ├── lib/
│   │   ├── db.ts             # MongoDB connection
│   │   ├── tmdb.ts           # TMDB API utilities
│   │   └── utils.ts          # Helper functions
│   │
│   ├── models/
│   │   └── Review.ts         # Mongoose schema
│   │
│   └── types/
│       ├── movie.ts          # TMDB types
│       └── review.ts         # Review types
│
├── docs/                     # Documentation
├── public/                   # Static assets
├── .env.local.example        # Environment template
└── package.json
```

---

## Usage / 사용법

### 1. Create a Review / 리뷰 작성

1. Click "새 리뷰 작성" (New Review) button
2. Search for a movie using the search box
3. Select a movie from the dropdown
4. Enter your rating (1-5 stars)
5. Select the watch date
6. Write your review
7. Click "저장" (Save)

### 2. View Reviews / 리뷰 보기

- **Grid View**: All reviews displayed in a responsive grid
- **Top Ranking**: Highly-rated reviews (4+ stars) shown at top
- Click any card to view full details

### 3. Edit/Delete Reviews / 리뷰 수정/삭제

1. Click on a review card to open details modal
2. Click "수정" (Edit) to edit the review
3. Click "삭제" (Delete) to remove the review

### 4. Filter Reviews / 리뷰 필터링

- **Search**: Type in the search bar to filter by title
- **Rating Filter**: Click star buttons to filter by minimum rating

---

## API Endpoints

### TMDB Movie Search / 영화 검색
```
GET /api/movies/search?query={title}&page={page}
```

### Review CRUD / 리뷰 CRUD
```
GET    /api/reviews           # List all reviews
POST   /api/reviews           # Create new review
GET    /api/reviews/{id}      # Get review details
PUT    /api/reviews/{id}      # Update review
DELETE /api/reviews/{id}      # Delete review
```

Query parameters for GET `/api/reviews`:
- `rating`: Filter by rating (1-5)
- `search`: Search by title
- `sort`: Sort by field (rating, watchedAt, createdAt)
- `order`: Sort order (asc, desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

---

## Environment Variables / 환경 변수

| Variable | Description | Example |
|----------|-------------|---------|
| `TMDB_API_KEY` | TMDB API v3 key | `a1b2c3d4e5f6g7h8i9j0` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/cinelog` |

---

## Development / 개발

### Available Scripts / 사용 가능한 스크립트

```bash
# Development server (Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Tech Details / 기술 상세

- **Turbopack**: Next.js 16's new bundler (5-10x faster)
- **Tailwind CSS v4**: CSS-first configuration
- **App Router**: Next.js App Router with Server Components
- **Dark Theme**: Netflix-inspired dark theme with custom colors
- **MongoDB Caching**: Connection caching for optimal performance

---

## Troubleshooting / 문제 해결

### Common Issues / 일반적인 문제

**Build fails:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**MongoDB connection timeout:**
- Check Network Access in MongoDB Atlas (allow 0.0.0.0/0 for dev)
- Verify username/password in connection string
- URL-encode special characters in password

**TMDB API errors:**
- Verify API key is correct
- Wait 5-10 minutes after applying for API key
- Check API key has "Developer" type

For more troubleshooting, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md).

---

## Cost / 비용

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel (Hobby) | Free | **$0** |
| MongoDB Atlas (M0) | Free | **$0** |
| TMDB API | Free | **$0** |
| **Total** | - | **$0** |

---

## License / 라이선스

This project is for personal use. TMDB data is provided under the TMDB API Terms of Use.

---

## Credits / 크레딧

- **Movie Data**: [The Movie Database (TMDB)](https://www.themoviedb.org/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [lucide](https://lucide.dev/)

---

## Support / 지원

- 📖 [Setup Guide](./docs/SETUP_EXTERNAL_SERVICES.md)
- 🚀 [Deployment Guide](./docs/DEPLOYMENT.md)
- 📋 [Full Plan](../plan.md) (Korean)

---

> **Made with ❤️ for movie lovers**
> Last updated: 2026-01-29
