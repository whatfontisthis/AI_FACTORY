# Agent Work Log

이 파일은 AI 에이전트들의 작업 기록입니다. 새로운 에이전트는 작업 전 이 파일을 참고하세요.

---

## 2026-01-18 14:00:00 - Code Explorer 🔍

**티켓:** Cursor IDE로 개발된 앱 파일 구조 분석 및 탐색
**상태:** ✅ 성공

### 작업 요약

Cursor IDE의 다양한 기능을 활용하여 Week_1의 개발된 앱들을 심층 분석했습니다.

#### 1. Cursor IDE 주요 기능 탐색

**코드베이스 검색 (Codebase Search)**
- 시맨틱 검색 기능을 활용하여 프로젝트 전반의 코드 패턴 파악
- "BMI 계산 로직은 어디에 있나요?" 같은 자연어 질문으로 코드 위치 추적
- 관련 파일들을 빠르게 발견하고 연결 관계 파악

**파일 구조 탐색**
- `glob_file_search`로 프로젝트 구조 전체 파악
- `list_dir`로 디렉토리 구조 시각화
- `read_file`로 핵심 파일 내용 분석

**AI 기반 코드 분석**
- Cursor의 AI 기능으로 복잡한 로직 이해
- 타입 정의와 인터페이스 관계 파악
- 함수 간 의존성 추적

#### 2. BMI Calculator 앱 분석

**프로젝트 구조:**
```
G03_BMI_Calculator/
├── app/
│   ├── page.tsx              # 메인 UI 컴포넌트 (React Client Component)
│   ├── layout.tsx            # 루트 레이아웃
│   ├── globals.css           # 전역 스타일
│   └── api/
│       └── bmi/
│           └── calculate/
│               └── route.ts  # Next.js API Route
├── lib/
│   ├── bmi.ts                # BMI 계산 로직 (비즈니스 로직)
│   └── bmi.test.ts           # 단위 테스트
└── public/                   # 정적 이미지 파일들
```

**주요 발견사항:**
- **아키텍처 패턴**: 프론트엔드와 백엔드 로직 분리
  - UI 로직: `app/page.tsx`에서 React 상태 관리 및 사용자 인터랙션 처리
  - 비즈니스 로직: `lib/bmi.ts`에서 순수 함수로 BMI 계산 로직 구현
  - API 엔드포인트: `app/api/bmi/calculate/route.ts`에서 Next.js App Router 활용

- **타입 안정성**: TypeScript를 활용한 엄격한 타입 정의
  ```typescript
  export enum BMICategory {
    UNDERWEIGHT = '저체중',
    NORMAL = '정상',
    OVERWEIGHT = '과체중',
    OBESE = '비만',
  }
  ```

- **사용자 경험**: 실시간 계산 및 시각적 피드백
  - `useEffect`와 디바운싱(300ms)을 활용한 자동 계산
  - 범위 슬라이더와 숫자 입력의 양방향 바인딩
  - 카테고리별 색상 및 이미지 표시

- **에러 처리**: 클라이언트와 서버 양쪽에서 검증
  - 클라이언트: 기본적인 유효성 검사
  - 서버: 상세한 범위 검증 (50-300cm, 10-500kg)

#### 3. Tax Calculator 앱 분석

**프로젝트 구조:**
```
Q01_Tax_Calculator/
├── app/
│   ├── page.tsx                    # 메인 페이지
│   ├── components/
│   │   ├── TaxCalculatorForm.tsx   # 입력 폼 컴포넌트
│   │   └── TaxResultDisplay.tsx     # 결과 표시 컴포넌트
│   └── api/
│       └── tax/
│           └── calculate/
│               └── route.ts        # 세금 계산 API
├── lib/
│   ├── types/
│   │   └── tax.types.ts            # 타입 정의
│   ├── constants/
│   │   └── tax.constants.ts        # 세율 상수
│   ├── services/
│   │   ├── deduction.service.ts    # 소득공제 계산
│   │   ├── tax-credit.service.ts   # 세액공제 계산
│   │   ├── income-tax.service.ts  # 소득세 계산
│   │   └── tax-calculator.service.ts # 메인 계산 로직
│   └── utils/
│       └── taxCalculator.ts        # 유틸리티 함수
└── lib/README.md                   # 상세한 계산 로직 문서화
```

**주요 발견사항:**
- **계층화된 아키텍처**: 관심사의 분리 (Separation of Concerns)
  - 타입 정의, 상수, 서비스 로직이 명확히 분리됨
  - 각 서비스가 단일 책임 원칙(SRP)을 따름

- **복잡한 비즈니스 로직의 모듈화**:
  ```
  1. 총급여 → 근로소득공제 → 근로소득금액
  2. 근로소득금액 - 소득공제 → 과세표준
  3. 과세표준 → 산출세액 (근로소득세)
  4. 산출세액 - 세액공제 → 결정세액
  5. 결정세액 × 10% → 지방소득세
  6. 결정세액 + 지방소득세 → 총 납부세액
  ```

- **문서화의 중요성**: `lib/README.md`에 계산 공식과 법적 근거 상세 기록
  - 세율표, 공제율, 한도 등이 명확히 문서화됨
  - API 사용 예시와 TypeScript 코드 예제 포함

- **컴포넌트 분리**: UI 컴포넌트를 Form과 Display로 분리하여 재사용성 향상

#### 4. Cursor IDE 활용 경험

**효율적인 코드 탐색:**
- 시맨틱 검색으로 "세금 계산 로직은 어떻게 구현되어 있나요?" 같은 질문으로 관련 코드 즉시 발견
- `grep` 기능으로 특정 함수나 변수 사용처 추적
- 파일 간 이동이 자동완성과 함께 원활하게 이루어짐

**AI 기반 코드 이해:**
- 복잡한 계산 로직을 AI가 설명해주어 빠른 이해 가능
- 타입 정의를 읽고 실제 사용처를 자동으로 찾아줌
- 코드 리뷰와 개선 제안을 실시간으로 받을 수 있음

**프로젝트 구조 파악:**
- `codebase_search`로 프로젝트 전반의 아키텍처 패턴 파악
- 의존성 그래프를 시각적으로 이해 가능
- 관련 파일들을 한 번에 탐색하여 전체적인 흐름 파악

#### 5. 비교 분석 결과

| 항목 | BMI Calculator | Tax Calculator |
|------|---------------|----------------|
| **복잡도** | 낮음 (단순 계산) | 높음 (다단계 계산) |
| **아키텍처** | 단순한 2계층 | 계층화된 모듈 구조 |
| **타입 정의** | 기본적인 enum/interface | 상세한 타입 시스템 |
| **문서화** | 기본 README | 상세한 lib/README.md |
| **테스트** | 단위 테스트 포함 | 통합 테스트 포함 |
| **에러 처리** | 기본 검증 | 다층 검증 시스템 |

#### 6. 학습한 Cursor IDE 기능들

1. **Codebase Search**: 자연어로 코드베이스 검색
2. **File Navigation**: 빠른 파일 탐색 및 이동
3. **Code Reading**: AI 기반 코드 설명 및 분석
4. **Type Inference**: TypeScript 타입 추론 및 자동완성
5. **Dependency Tracking**: 함수 및 변수 사용처 추적
6. **Project Structure Analysis**: 프로젝트 구조 자동 파악

---

## 2026-01-18 13:30:00 - Documentation Writer 📝

**티켓:** 분석 결과 문서화 및 README 작성
**상태:** ✅ 성공

### 작업 요약

- AGENT_WORK_LOG.md 생성 및 작업 기록 작성
- README.md 생성 및 프로젝트 설명 문서화
- Cursor IDE 기능 활용 가이드 작성

---
