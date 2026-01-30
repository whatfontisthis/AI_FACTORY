# Firebase 설정 가이드 (초보자용)

이 가이드는 Firebase를 처음 사용하는 분을 위한 **단계별 설정 안내**입니다.  
한 단계씩 따라 하시면 됩니다.

---

## 준비물

- Google 계정 (Gmail 로그인 가능한 계정)
- 이 프로젝트의 `.env.local` 파일 (프로젝트 루트에 있음)

---

## Step 1: Firebase 콘솔 접속

1. 웹 브라우저에서 아래 주소를 엽니다.  
   **https://console.firebase.google.com**
2. Google 계정으로 **로그인**합니다.
3. "Firebase Console" 화면이 보이면 성공입니다.

---

## Step 2: 새 프로젝트 만들기

1. **"프로젝트 추가"** 또는 **"Create a project"** 버튼을 클릭합니다.
2. **프로젝트 이름**을 입력합니다.  
   예: `today-menu` 또는 `q3-menu` (원하는 이름으로 해도 됩니다.)
3. **"계속"** / **"Continue"** 를 클릭합니다.
4. **Google Analytics** 설정 화면이 나오면:
   - 켜도 되고, 꺼도 됩니다. (초보자는 **"이 프로젝트에 Google Analytics 사용 설정 안 함"** 선택해도 됩니다.)
5. **"프로젝트 만들기"** / **"Create project"** 를 클릭합니다.
6. "프로젝트가 준비되었습니다" 메시지가 나오면 **"계속"** 을 클릭합니다.

---

## Step 3: Firestore 데이터베이스 만들기

1. 왼쪽 메뉴에서 **"빌드"** (Build) → **"Firestore Database"** 를 클릭합니다.  
   (또는 **"Build"** → **"Firestore Database"**)
2. **"데이터베이스 만들기"** / **"Create database"** 버튼을 클릭합니다.
3. **보안 규칙** 선택:
   - **"테스트 모드에서 시작"** / **"Start in test mode"** 를 선택합니다.  
     (개발 중에는 이렇게 하면 쉽게 사용할 수 있습니다. 나중에 규칙을 바꿀 수 있습니다.)
4. **"다음"** / **"Next"** 를 클릭합니다.
5. **위치** 선택:
   - 목록에서 `asia-northeast3 (서울)` 또는 가까운 지역을 선택합니다.
6. **"사용 설정"** / **"Enable"** 를 클릭합니다.
7. Firestore 화면에 "데이터" 탭이 보이면 설정이 완료된 것입니다.

---

## Step 4: 웹 앱 추가 (설정 값 얻기)

1. 왼쪽 상단 **휴지통 아이콘 옆 프로젝트 이름**을 클릭해 **프로젝트 개요**로 갑니다.  
   또는 왼쪽 메뉴 맨 위 **"프로젝트 개요"** / **"Project overview"** 를 클릭합니다.
2. 프로젝트 개요 페이지에서 **"</>"** (웹 아이콘) 또는 **"웹 앱에 Firebase 추가"** 를 클릭합니다.
3. **앱 닉네임**을 입력합니다.  
   예: `today-menu-web` (아무 이름이나 괜찮습니다.)
4. **"Firebase Hosting"** 은 지금 **체크하지 않아도** 됩니다.
5. **"앱 등록"** / **"Register app"** 를 클릭합니다.
6. **"Firebase SDK 구성"** 화면이 나옵니다.  
   `firebaseConfig` 안에 있는 값들이 **우리가 필요한 값**입니다.  
   예시는 다음과 비슷하게 생겼습니다:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

7. 이 화면을 **그대로 두고** 다음 단계로 갑니다. (닫지 마세요.)

---

## Step 5: .env.local 에 값 넣기

1. 이 프로젝트 폴더를 엽니다. (예: `c:\Users\user\Downloads\q3`)
2. **`.env.local`** 파일을 엽니다. (메모장, VS Code, Cursor 등)
3. Firebase 콘솔에 보이는 `firebaseConfig` 값들을 **아래 규칙대로** 복사해서 넣습니다.

   **주의:**  
   - 값 앞뒤에 **따옴표 없이** 넣습니다.  
   - `=` 뒤에 **공백 없이** 바로 값을 씁니다.  
   - 이미 다른 값이 들어가 있으면 **그 자리를 덮어쓰기** 합니다.

   | .env.local 변수 이름 | Firebase config에서 복사할 곳 |
   |---------------------|------------------------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey: "여기값"` → 따옴표 안의 값만 |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain: "여기값"` → 따옴표 안의 값만 |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId: "여기값"` → 따옴표 안의 값만 |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket: "여기값"` → 따옴표 안의 값만 |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId: "여기값"` → 따옴표 안의 값만 |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId: "여기값"` → 따옴표 안의 값만 |

4. **예시** (실제 값은 본인 Firebase에 나온 값으로 바꿔야 합니다):

   ```env
   # Firebase - Firebase Console에서 복사한 값
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

   # OpenWeatherMap - 이미 발급받은 API 키
   OPENWEATHER_API_KEY=여기에_본인_OpenWeatherMap_키
   ```

5. **저장**합니다.

---

## Step 6: 메뉴 데이터 넣기 (시드 스크립트 실행)

Firestore는 비어 있으면 추천이 동작하지 않습니다.  
프로젝트에 포함된 **시드 스크립트**로 메뉴 10개를 한 번에 넣습니다.

1. **터미널**을 엽니다.  
   (Cursor/VS Code 하단 "터미널" 또는 Windows "명령 프롬프트"/"PowerShell")
2. 프로젝트 폴더로 이동합니다:
   ```bash
   cd c:\Users\user\Downloads\q3
   ```
3. 아래 명령을 실행합니다:
   ```bash
   npm run seed
   ```
4. 다음과 비슷한 메시지가 나오면 성공입니다:
   ```
   Added: 마라탕 (menu_1)
   Added: 삼겹살 (menu_2)
   ...
   Seed complete. Total: 10
   ```

**에러가 나는 경우:**

- `NEXT_PUBLIC_FIREBASE_...` 이 비어 있다 → Step 5에서 `.env.local` 값을 다시 확인하고 저장 후 다시 `npm run seed` 실행.
- `Permission denied` / `permission-denied` → Firestore를 "테스트 모드"로 만들었는지 Step 3에서 확인. 테스트 모드가 아니면 Firestore 규칙을 "테스트 모드"로 바꾼 뒤 다시 시도.

---

## Step 7: 동작 확인

1. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```
2. 브라우저에서 **http://localhost:3000** 을 엽니다.
3. 기분을 하나 선택하고 **"오늘 뭐 먹지? 추천받기"** 버튼을 누릅니다.
4. 메뉴와 추천 사유가 나오면 **Firebase 설정이 정상**입니다.

---

## 요약 체크리스트

- [ ] Firebase 콘솔 (console.firebase.google.com) 로그인
- [ ] 새 프로젝트 생성
- [ ] Firestore 데이터베이스 생성 (테스트 모드, 서울 리전)
- [ ] 웹 앱 추가 후 `firebaseConfig` 확인
- [ ] `.env.local` 에 6개 Firebase 값 + OpenWeatherMap API 키 입력 후 저장
- [ ] `npm run seed` 로 메뉴 데이터 넣기
- [ ] `npm run dev` 로 실행 후 추천 버튼으로 확인

---

## 자주 묻는 질문

**Q. Firebase 값은 어디서 다시 볼 수 있나요?**  
Firebase 콘솔 → 프로젝트 개요 → 프로젝트 설정(톱니바퀴) → "일반" 탭 → "내 앱" 에서 웹 앱을 선택하면 `firebaseConfig` 를 다시 볼 수 있습니다.

**Q. 테스트 모드가 위험하지 않나요?**  
테스트 모드는 "일정 기간 동안 누구나 읽기/쓰기 가능"한 상태라, **실제 서비스를 공개할 때는 반드시 보안 규칙을 바꿔야 합니다.** 지금은 로컬 개발용으로만 사용하시면 됩니다.

**Q. 시드를 두 번 실행하면 어떻게 되나요?**  
같은 ID로 덮어쓰기 때문에 메뉴가 중복되지 않고, 다시 실행해도 괜찮습니다.

추가로 막히는 단계가 있으면 **몇 단계(Step 번호)에서 막혔는지** 알려주시면 그 부분만 더 자세히 안내할 수 있습니다.
