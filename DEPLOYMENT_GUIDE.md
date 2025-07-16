# AI DaJo - 배포 가이드

## 현재 문제점 분석

현재 aidajo.com 웹사이트가 제대로 작동하지 않는 이유는 **API 엔드포인트 설정** 때문입니다:

- **개발 환경**: Replit에서 백엔드와 프론트엔드가 같은 서버에서 실행됨 (상대경로 `/api/ai-tools` 사용)
- **프로덕션 환경**: Hostinger에는 프론트엔드만 배포되어 있어 API 요청이 실패함

## 해결 방안

### 1. 백엔드 배포 (Replit Deployments)

```bash
# 1. Replit에서 "Deploy" 버튼 클릭
# 2. 배포 URL 확인 (예: https://aidajo-backend.replit.app)
# 3. 환경 변수 설정:
#    - DATABASE_URL: PostgreSQL 연결 문자열
#    - GOOGLE_CLIENT_ID: Google OAuth 클라이언트 ID  
#    - GOOGLE_CLIENT_SECRET: Google OAuth 클라이언트 시크릿
#    - SESSION_SECRET: 세션 암호화 키
```

### 2. 프론트엔드 빌드 및 배포

```bash
# 프로덕션 빌드 생성
node build-production.js

# 또는 백엔드 URL 직접 지정
BACKEND_URL=https://your-backend-url.replit.app node build-production.js
```

### 3. Hostinger 업로드

1. `dist/` 폴더의 모든 파일을 Hostinger의 `public_html` 폴더에 업로드
2. `.htaccess` 파일이 포함되어 있는지 확인 (SPA 라우팅 지원)

## 설정된 기능들

### ✅ 환경별 API 설정
- **개발**: 상대경로 사용 (`/api/ai-tools`)
- **프로덕션**: 전체 URL 사용 (`https://backend-url.replit.app/api/ai-tools`)

### ✅ 자동 빌드 스크립트
- 프론트엔드 빌드
- `.htaccess` 생성 (SPA 라우팅)
- 정적 파일 최적화
- 배포 정보 생성

### ✅ CORS 및 인증 설정
- 백엔드에서 CORS 허용
- Google OAuth 설정 완료
- 세션 관리 구현

## 테스트 방법

### 로컬 테스트
```bash
npm run dev
# http://localhost:5000 에서 테스트
```

### 프로덕션 테스트
```bash
# 프로덕션 빌드
node build-production.js

# 로컬 서버로 테스트
cd dist
python -m http.server 8000
# http://localhost:8000 에서 테스트
```

## 주요 파일 구조

```
├── client/src/config/environment.ts    # 환경별 API 설정
├── client/src/lib/queryClient.ts       # API 요청 처리
├── build-production.js                 # 프로덕션 빌드 스크립트
├── server/                             # 백엔드 코드
└── dist/                              # 프로덕션 빌드 결과물
```

## 문제 해결

### API 요청 실패 시
1. 브라우저 개발자 도구에서 Network 탭 확인
2. 실제 요청 URL 확인
3. 백엔드 서버 상태 확인
4. CORS 설정 확인

### 인증 문제 시
1. Google OAuth 콘솔에서 도메인 설정 확인
2. 환경 변수 설정 확인
3. 세션 쿠키 설정 확인

## 다음 단계

1. **백엔드 배포**: Replit Deployments로 백엔드 서버 배포
2. **프론트엔드 빌드**: 새로운 백엔드 URL로 프론트엔드 빌드
3. **Hostinger 업로드**: 빌드된 파일들을 Hostinger에 업로드
4. **테스트**: 실제 도메인에서 모든 기능 테스트

이제 코드가 정리되었고 프로덕션 배포 준비가 완료되었습니다!