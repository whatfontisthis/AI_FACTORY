# Vercel 배포 가이드

## 배포 방법

### 방법 1: Vercel CLI를 사용한 배포 (권장)

1. **터미널에서 프로젝트 디렉토리로 이동**
   ```bash
   cd c:\Users\user\Downloads\q3
   ```

2. **Vercel에 로그인**
   ```bash
   npx vercel login
   ```

3. **프로젝트 배포**
   ```bash
   npx vercel
   ```
   
   배포 과정에서:
   - "Set up and deploy" 선택
   - 프로젝트 이름 설정 (또는 기본값 사용)
   - 프레임워크는 자동으로 Next.js로 감지됨

4. **프로덕션 배포**
   ```bash
   npx vercel --prod
   ```

### 방법 2: Vercel 웹 대시보드 사용

1. **GitHub에 저장소 푸시** (선택사항)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Vercel 웹사이트 접속**
   - https://vercel.com 접속
   - GitHub 계정으로 로그인
   - "New Project" 클릭
   - 저장소 선택 또는 직접 업로드

## 환경 변수 설정

배포 후 Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수

1. **Firebase 설정**
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

2. **OpenWeatherMap API**
   - `OPENWEATHER_API_KEY`

### 환경 변수 설정 방법

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables 이동
3. 각 변수를 추가하고 "Save" 클릭
4. 배포 재실행 (Redeploy)

## 배포 후 확인 사항

- [ ] 환경 변수가 모두 설정되었는지 확인
- [ ] Firebase Firestore 데이터베이스에 메뉴 데이터가 있는지 확인 (`npm run seed` 실행 필요)
- [ ] OpenWeatherMap API 키가 유효한지 확인
- [ ] 이미지가 정상적으로 로드되는지 확인

## 문제 해결

### 빌드 에러 발생 시
- 환경 변수가 제대로 설정되었는지 확인
- 로컬에서 `npm run build`가 성공하는지 확인

### 이미지가 로드되지 않을 때
- `next.config.ts`의 `remotePatterns` 설정 확인
- Unsplash 및 FlagCDN 도메인이 허용되어 있는지 확인

### Firebase 연결 오류
- Firebase 프로젝트 설정 확인
- Firestore 데이터베이스가 생성되어 있는지 확인
- 보안 규칙이 올바르게 설정되어 있는지 확인
