# Firebase Firestore 보안 규칙 설정 가이드

## 문제 상황
배포된 Vercel 사이트에서 "No menu in database" 에러가 발생하는 경우, Firebase Firestore 보안 규칙이 읽기를 허용하지 않아서 발생할 수 있습니다.

## 해결 방법

### 방법 1: Firebase Console에서 직접 설정 (권장)

1. **Firebase Console 접속**
   - https://console.firebase.google.com 접속
   - 프로젝트 `today-menu-c1f16` 선택

2. **Firestore Database로 이동**
   - 왼쪽 메뉴에서 **"Build"** → **"Firestore Database"** 클릭
   - 상단 탭에서 **"Rules"** 탭 클릭

3. **보안 규칙 업데이트**
   아래 규칙을 복사하여 붙여넣기:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // menus 컬렉션은 모든 사용자가 읽을 수 있도록 허용
       match /menus/{menuId} {
         allow read: if true;
         allow write: if false; // 쓰기는 서버에서만 (seed 스크립트)
       }
     }
   }
   ```

4. **"Publish" 버튼 클릭**
   - 규칙을 저장하고 적용합니다.

### 방법 2: Firebase CLI 사용 (선택사항)

Firebase CLI가 설치되어 있다면:

```bash
firebase deploy --only firestore:rules
```

## 확인 사항

보안 규칙 적용 후:
1. Vercel 배포 사이트 새로고침
2. "최적의 메뉴 3가지 추천받기" 버튼 클릭
3. 추천 메뉴가 정상적으로 표시되는지 확인

## 보안 규칙 설명

- `allow read: if true` - 모든 사용자가 menus 컬렉션을 읽을 수 있음
- `allow write: if false` - 쓰기는 허용하지 않음 (seed 스크립트는 서버에서 실행)

## 참고

- 로컬에서 `npm run seed`를 실행하면 같은 Firebase 프로젝트에 데이터가 추가됩니다
- Vercel 배포 사이트도 같은 Firebase 프로젝트를 사용하므로, 보안 규칙만 올바르게 설정되면 데이터에 접근할 수 있습니다
