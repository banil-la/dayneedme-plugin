# Figma 플러그인과 Supabase 및 Python 백엔드

## 개요

이 프로젝트는 Dayneed.me의 데이터베이스를 Figma에서 사용하기 위한 플러그인 입니다.

## 프로젝트 구조

### **Figma 플러그인 프로젝트**

- **프레임워크:** [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/) 기반으로 구축.
- **목적:** Figma 사용자들이 Supabase 데이터베이스와 상호작용하고, Figma 프레임의 짧은 URL을 생성할 수 있도록 지원.

#### **디렉터리 구조**

```
src/
| - components/
|    | - LoggedIn.tsx
|    | - LoggedOut.tsx
| - hooks/
|    | - copyToClipboard.ts
|    | - useAuthToken.ts
constants.ts
main.ts
types.ts
ui.tsx
```

- **`main.ts`**: 플러그인의 주요 로직을 담당.
- **`ui.tsx`**: 플러그인의 UI를 관리하며, 인증 상태에 따라 로그인/로그아웃 화면을 렌더링.
- **`components/LoggedIn.tsx`**: 인증된 사용자를 위한 기능 처리(예: 짧은 URL 생성).
- **`components/LoggedOut.tsx`**: 사용자 로그인 처리.
- **`hooks/useAuthToken.ts`**: 인증 토큰 관리를 위한 커스텀 훅.

#### **주요 기능**

1. **로그인:** Supabase를 통해 이메일 및 비밀번호로 사용자 인증.
2. **토큰 관리:** Figma의 클라이언트 스토리지를 사용하여 인증 토큰 저장, 로드, 삭제.
3. **짧은 URL 생성:** 선택한 Figma 프레임의 짧은 URL 생성.

---

### **Python FastAPI 백엔드**

- **프레임워크:** FastAPI로 구축.
- **목적:** Supabase 서비스 및 기타 외부 API와 안전하게 통신하는 중개 역할.

#### **디렉터리 구조**

```
api/
| - service/
|    | - figma/
|    |    | - share.py
|    | - auth.py
|    | - vision.py
| - index.py
```

- **`index.py`**: FastAPI 서버의 주요 진입점.
- **`service/auth.py`**: Supabase 인증 관리.
- **`service/figma/share.py`**: URL 단축 및 Supabase 데이터베이스 상호작용 처리.
- **`service/vision.py`**: (구현 예정) Google Vision API를 사용한 앱 화면 분석.

#### **주요 기능**

1. **인증 프록시:** 플러그인의 로그인 요청을 Supabase로 안전하게 전달.
2. **짧은 URL 생성:** Supabase를 사용하여 짧은 URL 생성.
3. **CORS 관리:** 로컬 및 프로덕션 환경에 따른 CORS 정책 설정.

---

## 워크플로우

1. **사용자 로그인:**

   - 사용자가 플러그인에서 이메일과 비밀번호를 입력.
   - 플러그인이 Python 백엔드(`/supabase-login`)로 인증 요청을 전송.
   - 백엔드가 Supabase를 통해 사용자를 인증하고, 액세스 토큰을 반환.

2. **토큰 관리:**

   - 플러그인이 인증 토큰을 Figma의 `clientStorage`에 저장.
   - 이후 인증이 필요한 요청에서 해당 토큰을 사용.

3. **짧은 URL 생성:**

   - 사용자가 Figma에서 프레임을 선택하고 "Generate Short URL" 버튼 클릭.
   - 플러그인이 선택된 프레임의 Figma URL을 생성하여 Python 백엔드(`/create-short-url`)로 전송.
   - 백엔드가 Supabase를 통해 짧은 URL을 생성하고 플러그인에 반환.

---

## 환경 변수

Python 백엔드를 실행하려면 다음 환경 변수가 필요합니다:

- **`SUPABASE_URL`**: Supabase 프로젝트의 기본 URL.
- **`SUPABASE_KEY`**: Supabase 프로젝트의 API 키.
- **`SERVICE_ACCOUNT_FILE_BASE64`**: Google Cloud 서비스 계정 JSON 파일의 Base64 인코딩 문자열.
- **`ENVIRONMENT`**: `local` 또는 `production` (CORS 정책을 결정).

`api/` 디렉터리에 `.env` 파일을 생성하고 위 변수들을 추가하세요.

---

## 배포

### **Figma 플러그인**

1. `create-figma-plugin` CLI를 사용하여 플러그인을 빌드.
2. Figma 개발자 콘솔을 통해 플러그인을 게시.

### **Python 백엔드**

1. 클라우드 제공자(e.g., Vercel)에 백엔드를 배포.
2. `vercel.json` 파일을 다음과 같이 구성:

   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/index.py"
       }
     ]
   }
   ```

3. Vercel 대시보드에서 환경변수 설정

---

ㅇ
