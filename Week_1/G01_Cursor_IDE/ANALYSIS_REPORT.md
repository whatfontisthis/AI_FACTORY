# 앱 분석 리포트 📊

Cursor IDE를 활용하여 Week_1의 개발된 앱들을 분석한 상세 리포트입니다.

## 📁 분석 대상 앱 목록

1. **G03_BMI_Calculator** - BMI 측정기 앱
2. **Q01_Tax_Calculator** - 세금 계산기 앱
3. **Q02_Weathers_App** - 날씨 앱 (참고)

---

## 🔬 G03_BMI_Calculator 상세 분석

### 프로젝트 구조

```
G03_BMI_Calculator/
├── app/
│   ├── page.tsx                    # 메인 페이지 컴포넌트 (276줄)
│   ├── layout.tsx                  # 루트 레이아웃
│   ├── globals.css                 # 전역 스타일
│   └── api/
│       └── bmi/
│           └── calculate/
│               └── route.ts        # BMI 계산 API 엔드포인트
├── lib/
│   ├── bmi.ts                      # BMI 계산 로직 (111줄)
│   └── bmi.test.ts                 # 단위 테스트 (174줄)
├── public/                         # 정적 이미지 파일
│   ├── 01_thin.jpeg
│   ├── 02_normal.jpeg
│   ├── 03_fat.jpeg
│   └── 04_obese.jpeg
└── package.json                    # 프로젝트 의존성
```

### 코드 분석

#### 1. 프론트엔드 (`app/page.tsx`)

**주요 기능:**
- React Client Component (`'use client'`)
- 실시간 BMI 계산 (디바운싱 300ms)
- 범위 슬라이더와 숫자 입력 양방향 바인딩
- 카테고리별 시각적 피드백 (색상, 이미지)

**상태 관리:**
```typescript
const [height, setHeight] = useState('170');
const [weight, setWeight] = useState('65');
const [bmi, setBmi] = useState<number | null>(null);
const [category, setCategory] = useState('');
const [error, setError] = useState('');
```

**API 호출 패턴:**
```typescript
const response = await fetch('/api/bmi/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ height: heightNum, weight: weightNum }),
});
```

#### 2. 비즈니스 로직 (`lib/bmi.ts`)

**타입 정의:**
```typescript
export enum BMICategory {
  UNDERWEIGHT = '저체중',
  NORMAL = '정상',
  OVERWEIGHT = '과체중',
  OBESE = '비만',
}

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryRange: string;
}
```

**핵심 함수:**
- `calculateBMI(heightInCm, weightInKg)`: BMI 계산 메인 함수
- `getBMICategory(bmi)`: BMI 값으로 카테고리 판정
- `isValidHeight(height)`: 키 유효성 검사 (50-300cm)
- `isValidWeight(weight)`: 몸무게 유효성 검사 (10-500kg)

**계산 공식:**
```
BMI = 몸무게(kg) / (키(m))²
```

**카테고리 기준 (WHO Asia-Pacific):**
- 저체중: 18.5 미만
- 정상: 18.5 ~ 22.9
- 과체중: 23 ~ 24.9
- 비만: 25 이상

#### 3. API 엔드포인트 (`app/api/bmi/calculate/route.ts`)

**POST 요청 처리:**
- 입력값 검증
- `lib/bmi.ts`의 `calculateBMI` 함수 호출
- 에러 처리 및 적절한 HTTP 상태 코드 반환

**GET 요청 처리:**
- BMI 카테고리 정보 제공
- 계산 공식 및 참고 자료 반환

### 설계 패턴

1. **관심사의 분리**
   - UI 로직: `app/page.tsx`
   - 비즈니스 로직: `lib/bmi.ts`
   - API 로직: `app/api/bmi/calculate/route.ts`

2. **타입 안전성**
   - TypeScript enum으로 카테고리 타입 안전성 확보
   - 인터페이스로 반환값 구조 명확화

3. **에러 처리**
   - 클라이언트: 기본 유효성 검사
   - 서버: 상세 범위 검증 및 명확한 에러 메시지

4. **사용자 경험**
   - 실시간 계산 (디바운싱으로 불필요한 API 호출 방지)
   - 시각적 피드백 (색상, 이미지, 애니메이션)

---

## 💰 Q01_Tax_Calculator 상세 분석

### 프로젝트 구조

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
│   │   └── tax.constants.ts        # 세율 및 상수
│   ├── services/
│   │   ├── deduction.service.ts    # 소득공제 계산
│   │   ├── tax-credit.service.ts   # 세액공제 계산
│   │   ├── income-tax.service.ts   # 소득세 계산
│   │   └── tax-calculator.service.ts # 메인 계산 로직
│   ├── utils/
│   │   └── taxCalculator.ts        # 유틸리티 함수
│   └── README.md                   # 상세한 계산 로직 문서
└── package.json
```

### 코드 분석

#### 1. 타입 시스템 (`lib/types/tax.types.ts`)

**입력 타입:**
```typescript
export interface TaxCalculationInput {
  totalSalary: number;              // 총급여
  incomeDeductions: IncomeDeductions; // 소득공제
  taxCredits: TaxCredits;          // 세액공제
}
```

**출력 타입:**
```typescript
export interface TaxCalculationResult {
  // 중간 계산값들
  earnedIncomeDeduction: number;    // 근로소득공제
  earnedIncome: number;             // 근로소득금액
  totalIncomeDeductions: number;    // 소득공제 합계
  taxableIncome: number;            // 과세표준
  
  // 최종 결과
  calculatedIncomeTax: number;     // 산출세액
  finalIncomeTax: number;           // 결정세액 (근로소득세)
  localIncomeTax: number;           // 지방소득세
  totalTax: number;                 // 총 납부세액
  netSalary: number;                // 실수령액
}
```

#### 2. 서비스 계층 구조

**계산 순서 (6단계):**
```
1. 총급여 → 근로소득공제 → 근로소득금액
   (deduction.service.ts)

2. 근로소득금액 - 소득공제 → 과세표준
   (deduction.service.ts)

3. 과세표준 → 산출세액 (근로소득세)
   (income-tax.service.ts)

4. 산출세액 - 세액공제 → 결정세액
   (tax-credit.service.ts)

5. 결정세액 × 10% → 지방소득세
   (income-tax.service.ts)

6. 결정세액 + 지방소득세 → 총 납부세액
   (tax-calculator.service.ts)
```

**각 서비스의 책임:**

- **deduction.service.ts**: 소득공제 관련 계산
  - `calculateEarnedIncomeDeduction()`: 근로소득공제 계산
  - `calculateTotalIncomeDeductions()`: 소득공제 합계
  - `calculateTaxableIncome()`: 과세표준 계산

- **tax-credit.service.ts**: 세액공제 관련 계산
  - `calculateEarnedIncomeTaxCredit()`: 근로소득세액공제
  - `calculateTotalTaxCredits()`: 세액공제 합계
  - `applyStandardTaxCreditIfNeeded()`: 표준세액공제 자동 적용

- **income-tax.service.ts**: 소득세 계산
  - `calculateIncomeTax()`: 산출세액 계산 (누진세율 적용)
  - `calculateLocalIncomeTax()`: 지방소득세 계산

- **tax-calculator.service.ts**: 메인 오케스트레이션
  - `calculateTax()`: 전체 계산 프로세스 조율

#### 3. 상수 관리 (`lib/constants/tax.constants.ts`)

**세율표 (2026년 기준):**
```typescript
export const INCOME_TAX_BRACKETS = [
  { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
  { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  // ... 더 많은 구간
];
```

**근로소득공제율:**
```typescript
export const EARNED_INCOME_DEDUCTION_RATES = [
  { max: 5_500_000, rate: 0.7 },
  { max: 45_000_000, rate: 0.4 },
  // ...
];
```

### 설계 패턴

1. **계층화된 아키텍처 (Layered Architecture)**
   - Presentation Layer: `app/components/`
   - API Layer: `app/api/`
   - Business Logic Layer: `lib/services/`
   - Data Layer: `lib/types/`, `lib/constants/`

2. **단일 책임 원칙 (SRP)**
   - 각 서비스가 하나의 책임만 가짐
   - deduction, tax-credit, income-tax 각각 독립적

3. **의존성 역전 원칙 (DIP)**
   - 상위 레이어가 하위 레이어에 의존
   - `tax-calculator.service.ts`가 다른 서비스들을 조율

4. **문서화**
   - `lib/README.md`에 상세한 계산 공식과 법적 근거 기록
   - 각 함수에 JSDoc 주석으로 설명 추가

---

## 🔄 비교 분석

### 복잡도 비교

| 항목 | BMI Calculator | Tax Calculator |
|------|---------------|----------------|
| **코드 라인 수** | ~400줄 | ~2000줄 |
| **파일 수** | 5개 주요 파일 | 15개 이상 |
| **계산 단계** | 1단계 (단순) | 6단계 (복잡) |
| **타입 정의** | 2개 (enum, interface) | 10개 이상 |
| **서비스 모듈** | 1개 (bmi.ts) | 4개 서비스 |

### 아키텍처 패턴

**BMI Calculator:**
- 단순한 2계층 구조
- UI와 비즈니스 로직 분리
- 적합한 경우: 단순한 계산 로직

**Tax Calculator:**
- 계층화된 모듈 구조
- 관심사별 서비스 분리
- 적합한 경우: 복잡한 비즈니스 로직

### 공통점

1. **타입 안전성**: TypeScript 활용
2. **에러 처리**: 다층 검증 시스템
3. **API 설계**: RESTful API 패턴
4. **사용자 경험**: 실시간 계산 및 피드백

### 차이점

| 관점 | BMI Calculator | Tax Calculator |
|------|---------------|----------------|
| **모듈화** | 기본적 | 고도화 |
| **문서화** | 기본 README | 상세한 lib/README.md |
| **테스트** | 단위 테스트 | 통합 테스트 포함 |
| **확장성** | 낮음 | 높음 |

---

## 🎯 Cursor IDE 활용 경험

### 효과적인 코드 탐색

1. **시맨틱 검색**
   - "세금 계산의 주요 단계는 무엇인가요?" → 6단계 프로세스 즉시 파악
   - "BMI 카테고리는 어떻게 결정되나요?" → `getBMICategory` 함수 발견

2. **의존성 추적**
   - 타입 정의 → 실제 사용처 자동 추적
   - 함수 호출 관계 시각화

3. **프로젝트 구조 파악**
   - 디렉토리 구조 자동 분석
   - 주요 진입점 파일 식별

### 학습 효과

- ✅ 실제 프로젝트의 아키텍처 패턴 이해
- ✅ TypeScript 타입 시스템의 실전 활용
- ✅ 모듈화와 재사용성의 중요성 체감
- ✅ 문서화의 가치 확인

---

**작성일:** 2026-01-18  
**분석 도구:** Cursor IDE 🔍
