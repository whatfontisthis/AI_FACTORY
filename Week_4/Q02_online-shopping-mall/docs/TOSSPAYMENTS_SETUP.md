# TossPayments 결제 연동 가이드

## ✅ 완료된 작업

### 1. 프론트엔드 (Client)
- ✅ `@tosspayments/tosspayments-sdk` 설치 완료
- ✅ Payment 페이지에 TossPayments 위젯 통합
- ✅ PaymentSuccess 페이지 생성 (결제 승인 처리)
- ✅ PaymentFail 페이지 생성 (결제 실패 처리)
- ✅ 라우팅 설정 완료

### 2. 백엔드 (Server)
- ✅ `POST /api/v1/orders/prepare` - 임시 주문 생성 API
- ✅ `POST /api/v1/payments/confirm` - 결제 승인 API
- ✅ Payment routes 등록 완료

### 3. 환경 변수
- ✅ 테스트용 API 키 설정 완료 (임시)

---

## 🔧 직접 해야 할 작업

### 1. 데이터베이스 마이그레이션 (필수)

**Supabase에서 다음 작업 수행:**

1. Supabase 프로젝트 대시보드 접속
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. **New Query** 버튼 클릭
4. 아래 SQL 코드를 붙여넣고 실행:

```sql
-- Migration: Add payment tracking fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_key varchar(200),
ADD COLUMN IF NOT EXISTS payment_method varchar(50),
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add comments for documentation
COMMENT ON COLUMN orders.payment_key IS 'TossPayments paymentKey from successful payment';
COMMENT ON COLUMN orders.payment_method IS 'Payment method (card, transfer, etc)';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was confirmed';
```

또는 파일에서 실행:
```bash
# Supabase SQL Editor에서 다음 파일 내용 실행
docs/02-design/migration-add-payment-fields.sql
```

### 2. TossPayments API 키 발급

#### 테스트 환경 (현재 설정됨)
현재는 공식 문서의 테스트 키를 사용 중입니다:
- ✅ Client Key: `test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm`
- ✅ Secret Key: `test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6`

**테스트 키 제약사항:**
- 실제 결제는 되지 않음
- 결제 승인 API는 성공 응답을 반환하지만 실제 출금은 없음
- 개발 및 테스트 용도로만 사용 가능

#### 실제 환경 키 발급 (나중에 필요할 때)

1. [TossPayments 개발자센터](https://developers.tosspayments.com) 접속
2. 회원가입 및 로그인
3. 대시보드에서 **새 프로젝트 생성**
4. 프로젝트 설정에서 **API 키** 확인

**발급받은 키를 환경변수에 설정:**

```bash
# client/.env.local
VITE_TOSS_CLIENT_KEY=live_gck_YOUR_CLIENT_KEY

# server/.env.local
TOSS_SECRET_KEY=live_gsk_YOUR_SECRET_KEY
```

---

## 🧪 테스트 방법

### 1. 서버 시작 확인

```bash
# 서버가 실행 중인지 확인 (Port 4000)
# 터미널 출력에서 다음 메시지 확인:
# "Server running on http://localhost:4000"
```

### 2. 클라이언트 시작 확인

```bash
# 클라이언트가 실행 중인지 확인 (Port 3000)
# 브라우저에서 http://localhost:3000 접속
```

### 3. 결제 플로우 테스트

#### Step 1: 장바구니에 상품 담기
1. 홈페이지에서 상품 클릭
2. 상품 상세 페이지에서 **장바구니 담기** 클릭
3. 우측 상단 장바구니 아이콘 클릭

#### Step 2: 주문 페이지로 이동
1. 장바구니에서 **구매하기** 버튼 클릭
2. 결제 페이지(`/payment`)로 자동 이동

#### Step 3: 배송지 정보 입력
1. **+ 새 배송지 추가** 클릭
2. 배송지 정보 입력:
   - 배송지명: 집
   - 받는 분: 홍길동
   - 연락처: 010-1234-5678
   - 우편번호: 12345
   - 주소: 서울시 강남구 테헤란로 123
   - 상세주소: 101동 101호
3. **배송지 저장** 클릭

#### Step 4: 결제 수단 선택
- TossPayments 위젯이 렌더링되면 결제 수단 선택
- 테스트 환경에서는 **카드 결제** 선택 권장

#### Step 5: 결제 진행
1. **결제하기** 버튼 클릭
2. TossPayments 결제창이 팝업으로 열림
3. 테스트 카드 정보 입력:
   - 카드번호: `1111-1111-1111-1111`
   - 유효기간: 미래 날짜 (예: 12/25)
   - CVC: 아무 3자리 (예: 123)
   - 비밀번호: 처음 2자리 (예: 12)
   - 생년월일: 6자리 (예: 990101)
4. **결제하기** 버튼 클릭

#### Step 6: 결제 완료 확인
- 성공 시: `/payment/success` 페이지로 리다이렉트
  - "주문이 완료되었습니다!" 메시지 표시
  - 주문번호 확인
  - 결제 정보 (금액, 수단, 시각) 표시
- 실패 시: `/payment/fail` 페이지로 리다이렉트
  - 오류 메시지 및 오류 코드 표시

### 4. 주문 내역 확인

1. 상단 메뉴에서 **주문내역** 클릭 (`/orders`)
2. 방금 완료한 주문이 목록에 표시되는지 확인
3. 주문 상태가 `paid`(결제 완료)인지 확인

---

## 🐛 문제 해결 (Troubleshooting)

### 1. 위젯이 렌더링되지 않는 경우

**증상:** 결제 페이지에서 결제 수단이 보이지 않음

**해결:**
- 브라우저 개발자 도구(F12) → Console 탭에서 에러 확인
- Client Key가 올바른지 확인: `client/.env.local`
- 페이지 새로고침 (Ctrl + F5)

### 2. 결제 승인 실패

**증상:** 결제창에서 결제 완료했는데 success 페이지에서 "결제 승인 실패" 메시지

**해결:**
- 서버 터미널에서 에러 로그 확인
- Secret Key가 올바른지 확인: `server/.env.local`
- 데이터베이스 마이그레이션이 완료되었는지 확인

### 3. 주문이 생성되지 않는 경우

**증상:** "Failed to prepare order" 에러

**해결:**
- 배송지가 선택되었는지 확인
- 장바구니가 비어있지 않은지 확인
- 서버 로그에서 Supabase 에러 확인

### 4. CORS 에러

**증상:** Network 탭에서 CORS policy 에러

**해결:**
```bash
# server/.env.local 확인
CLIENT_URL=http://localhost:3000
```

---

## 📊 결제 흐름 요약

```
1. 사용자: 결제 페이지 접속
   ↓
2. 프론트: TossPayments 위젯 로드 및 렌더링
   ↓
3. 사용자: 결제 수단 선택 및 결제 버튼 클릭
   ↓
4. 프론트: POST /orders/prepare (임시 주문 생성)
   ← 서버: { orderId: "uuid" } 반환
   ↓
5. 프론트: widgetsRef.current.requestPayment() 호출
   ↓
6. TossPayments: 결제창 팝업 열림
   ↓
7. 사용자: 결제 정보 입력 및 승인
   ↓
8. TossPayments: successUrl로 리다이렉트 (paymentKey, orderId, amount 포함)
   ↓
9. 프론트(Success 페이지): POST /payments/confirm
   ↓
10. 서버:
    - 주문 조회 및 금액 검증
    - TossPayments API로 결제 승인 요청
    - 주문 상태를 'paid'로 업데이트
    - 장바구니 비우기
   ↓
11. 프론트: 결제 완료 UI 표시
```

---

## 🔒 보안 고려사항

### 이미 구현된 보안 기능:
- ✅ **금액 검증**: 클라이언트에서 전송한 금액을 서버에서 재계산하여 검증
- ✅ **Secret Key 보호**: 서버 측에서만 사용, 클라이언트 노출 없음
- ✅ **Base64 인코딩**: Authorization 헤더에 `SECRET_KEY:` 형식으로 인코딩
- ✅ **주문 상태 확인**: 결제 승인 시 주문이 `pending` 상태인지 확인

### 추가 권장사항:
- 실제 운영 환경에서는 HTTPS 필수
- `.env.local` 파일은 절대 Git에 커밋하지 말 것
- API 키는 정기적으로 교체

---

## 📝 참고 자료

- [TossPayments 개발자 문서](https://docs.tosspayments.com/guides/payment-widget/integration)
- [TossPayments SDK Reference](https://docs.tosspayments.com/reference/widget-sdk)
- [테스트 카드 정보](https://docs.tosspayments.com/reference/test-card)

---

## ✨ 다음 단계

결제 기능이 정상적으로 작동하면:
1. 실제 API 키 발급 및 적용
2. 주문 취소/환불 기능 추가
3. 결제 내역 상세 조회 페이지 개선
4. 배송 추적 기능 추가
