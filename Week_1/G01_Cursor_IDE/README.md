# G01 - Cursor IDE로 앱 뽀개보기 🔍

이 프로젝트는 Cursor IDE의 다양한 기능을 활용하여 개발된 앱들의 파일 구조와 코드를 분석하는 과제입니다.

## 📋 프로젝트 개요

Cursor IDE의 강력한 AI 기반 코드 탐색 및 분석 기능을 활용하여 Week_1의 개발된 앱들을 심층 분석하고, 각 앱의 아키텍처 패턴과 설계 원칙을 파악합니다.

## 🎯 학습 목표

1. Cursor IDE의 코드베이스 검색 기능 활용
2. 프로젝트 구조 분석 및 아키텍처 패턴 이해
3. 코드 의존성 및 모듈 간 관계 파악
4. 실제 프로젝트의 설계 원칙 학습

## 🔧 사용된 Cursor IDE 기능

### 1. Codebase Search (시맨틱 검색)
자연어 질문으로 코드베이스 전체를 검색하고 관련 코드를 찾습니다.

**예시:**
- "BMI 계산 로직은 어디에 있나요?"
- "세금 계산의 주요 함수는 무엇인가요?"
- "에러 처리는 어떻게 구현되어 있나요?"

### 2. File Navigation
프로젝트의 파일 구조를 빠르게 탐색하고 이동합니다.

**주요 명령:**
- `Ctrl+P` (Windows) / `Cmd+P` (Mac): 파일 빠른 열기
- 파일 탐색기에서 디렉토리 구조 확인
- 파일 간 자동 완성 및 이동

### 3. Code Reading & Analysis
AI가 코드를 읽고 설명해주며, 복잡한 로직을 이해하는 데 도움을 줍니다.

**기능:**
- 함수의 역할과 동작 방식 설명
- 타입 정의와 인터페이스 관계 파악
- 코드 흐름 및 의존성 추적

### 4. Type Inference & Autocomplete
TypeScript 타입을 자동으로 추론하고, 정확한 자동완성을 제공합니다.

### 5. Dependency Tracking
함수, 변수, 타입의 사용처를 추적하여 코드 영향 범위를 파악합니다.

## 📊 분석한 앱들

### 1. BMI Calculator (G03)

**위치:** `Week_1/G03_BMI_Calculator/`

**주요 특징:**
- **아키텍처**: 프론트엔드/백엔드 로직 분리
- **기술 스택**: Next.js 16, React, TypeScript, Tailwind CSS
- **핵심 파일:**
  - `app/page.tsx`: 메인 UI 컴포넌트
  - `lib/bmi.ts`: BMI 계산 비즈니스 로직
  - `app/api/bmi/calculate/route.ts`: API 엔드포인트

**학습 포인트:**
- React Client Component의 상태 관리
- Next.js App Router의 API Route 활용
- 타입 안전성을 위한 TypeScript enum 활용
- 실시간 계산을 위한 디바운싱 패턴

### 2. Tax Calculator (Q01)

**위치:** `Week_1/Q01_Tax_Calculator/`

**주요 특징:**
- **아키텍처**: 계층화된 모듈 구조 (Layered Architecture)
- **기술 스택**: Next.js 16, React, TypeScript, Tailwind CSS
- **핵심 구조:**
  ```
  lib/
  ├── types/          # 타입 정의
  ├── constants/      # 상수 (세율 등)
  ├── services/       # 비즈니스 로직 서비스
  └── utils/          # 유틸리티 함수
  ```

**학습 포인트:**
- 관심사의 분리 (Separation of Concerns)
- 단일 책임 원칙 (Single Responsibility Principle)
- 복잡한 비즈니스 로직의 모듈화
- 상세한 문서화의 중요성

## 🔍 분석 방법론

### 1단계: 프로젝트 구조 파악
- `list_dir`로 디렉토리 구조 확인
- `glob_file_search`로 주요 파일 패턴 파악
- `package.json`으로 의존성 및 스크립트 확인

### 2단계: 핵심 로직 분석
- `codebase_search`로 주요 기능 검색
- `read_file`로 핵심 파일 읽기
- 함수 및 컴포넌트의 역할 파악

### 3단계: 의존성 추적
- 타입 정의와 실제 사용처 연결
- 함수 호출 관계 파악
- 모듈 간 의존성 이해

### 4단계: 패턴 분석
- 아키텍처 패턴 식별
- 설계 원칙 적용 여부 확인
- 개선 가능한 부분 파악

## 📈 주요 발견사항

### 아키텍처 패턴 비교

| 항목 | BMI Calculator | Tax Calculator |
|------|---------------|----------------|
| **복잡도** | 낮음 | 높음 |
| **구조** | 단순 2계층 | 계층화된 모듈 |
| **타입 시스템** | 기본 | 상세 |
| **문서화** | 기본 | 상세 |
| **테스트** | 단위 테스트 | 통합 테스트 |

### 공통 설계 원칙

1. **타입 안전성**: TypeScript를 통한 엄격한 타입 체크
2. **에러 처리**: 클라이언트와 서버 양쪽에서 검증
3. **사용자 경험**: 실시간 피드백 및 직관적인 UI
4. **코드 재사용성**: 컴포넌트 및 함수 모듈화

## 🛠️ Cursor IDE 활용 팁

### 효율적인 코드 탐색
1. 자연어로 질문하기: "이 함수는 어디서 사용되나요?"
2. 파일 간 빠른 이동: `Ctrl+Click` 또는 `F12` (Go to Definition)
3. 관련 파일 찾기: `Shift+F12` (Find All References)

### 코드 이해하기
1. AI에게 코드 설명 요청
2. 타입 정의 먼저 읽기
3. 테스트 코드로 사용 예시 확인

### 프로젝트 구조 파악하기
1. 루트 디렉토리부터 탐색
2. 주요 진입점 파일 확인 (`page.tsx`, `route.ts` 등)
3. 라이브러리 및 유틸리티 폴더 구조 파악

## 📝 작업 기록

상세한 작업 기록은 [AGENT_WORK_LOG.md](./AGENT_WORK_LOG.md)를 참고하세요.

## 🎓 학습 성과

이 프로젝트를 통해 다음을 학습했습니다:

1. ✅ Cursor IDE의 강력한 코드 탐색 기능 활용법
2. ✅ 실제 프로젝트의 아키텍처 패턴 이해
3. ✅ TypeScript 기반 프로젝트의 타입 시스템 이해
4. ✅ Next.js App Router의 구조와 활용법
5. ✅ 모던 웹 개발의 모범 사례 파악

## 📚 참고 자료

- [Cursor IDE 공식 문서](https://cursor.sh/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

---

**작성일:** 2026-01-18  
**작성자:** Code Explorer Agent 🔍
