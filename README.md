# Supabase 연동 Figma 플러그인

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

## 주요 기능

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

## 개발 과정

### **UI 컴포넌트와 main.ts**의 통신 방식

- UI 컴포넌트와 main.ts의 통신으로 플러그인이 동작.
- Create Figma Plugin 프레임워크에서 제공하는 `emit`과 `on` 유틸리티를 통해 통신

#### 1. UI 컴포넌트

- **`emit`** : UI에서 main.ts로 메시지 전송
- **이벤트 리스너**: main.ts에서 `on` 또는 `window.addEventListener`를 사용해 메시지 수신

#### 2. main.ts

- **`on`** : UI에서 보낸 메시지 수신
- **`emit`** : UI로 응답 전송

### 새 기능 추가 방법

#### 1. 새 메시지 타입 정의

- 새로운 기능의 데이터 구조와 메시지 타입을 `types.ts` 파일에 정의
- 이를 통해 UI와 메인 프로세스 간의 통신을 일관되게 유지

```typescript
export interface GeneratePreviewHandler {
  type: "GENERATE_PREVIEW";
  payload: { frameId: string };
}

export interface PreviewGeneratedHandler {
  type: "PREVIEW_GENERATED";
  payload: { previewUrl: string };
}
```

#### 2. main.ts에서 메시지 처리

- main.ts에서 UI가 보낸 메시지를 수신하고 처리하는 로직 추가.

```
import { emit, on } from "@create-figma-plugin/utilities";

on("GENERATE_PREVIEW", async ({ frameId }: { frameId: string }) => {
  console.log("GENERATE_PREVIEW 수신됨, frameId:", frameId);

  try {
    const node = figma.getNodeById(frameId);
    if (!node || node.type !== "FRAME") {
      throw new Error("선택된 노드가 유효한 프레임이 아닙니다.");
    }

    // 예시: 프리뷰 URL 생성 (실제 로직으로 대체 필요)
    const previewUrl = `https://preview-service.com/preview/${frameId}`;

    console.log("프리뷰 생성됨:", previewUrl);
    emit("PREVIEW_GENERATED", { previewUrl });
  } catch (error) {
    console.error("프리뷰 생성 중 오류 발생:", error);
    emit("PREVIEW_GENERATED", { previewUrl: null });
  }
});
```

#### 3. UI 컴포넌트 업데이트

- UI컴포넌트를 수정하고 main.ts로 다시 메시지를 보내 응답

```
import { h } from "preact";
import { useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

const LoggedIn = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleGeneratePreview = () => {
    console.log("프리뷰 생성 요청 중...");
    emit("GENERATE_PREVIEW", { frameId: "selected-frame-id" }); // 실제 프레임 ID로 대체 필요
  };

  on("PREVIEW_GENERATED", ({ previewUrl }: { previewUrl: string }) => {
    console.log("프리뷰 URL 수신됨:", previewUrl);
    setPreviewUrl(previewUrl);
  });

  return (
    <div>
      <button onClick={handleGeneratePreview}>프리뷰 생성</button>
      {previewUrl && (
        <p>
          프리뷰 URL: <a href={previewUrl}>{previewUrl}</a>
        </p>
      )}
    </div>
  );
};

export default LoggedIn;
```

---

## 환경 변수

Python 백엔드를 실행하려면 다음 환경 변수가 필요합니다:

- **`SUPABASE_URL`**: Supabase 프로젝트의 기본 URL.
- **`SUPABASE_KEY`**: Supabase 프로젝트의 API 키.
- **`SERVICE_ACCOUNT_FILE_BASE64`**: Google Cloud 서비스 계정 JSON 파일의 Base64 인코딩 문자열.
- **`ENVIRONMENT`**: `local` 또는 `production` (CORS 정책을 결정).

`api/` 디렉터리에 `.env` 파일을 생성하고 위 변수들을 추가하세요.

컴포넌트 불러올때

- 규칙에 맞춰서 컴포넌트 네이밍
  04 BTN / Basic / Bottom
  ㄴ 04 BTN / Basic / Bottom
  ㄴ - 00 res / Btn / Btn_bottom
- 리소스 자동 네이밍
  ㄴ 규칙(?)

리소스

- 개발자들이 뽑아서 사용하는 중
- SVG, 비트맵 혼재됨
- SVG는 알아서 뽑아서 사용하지만, 비트맵은 따로 뽑아서 줘야함
- 로티도 분리가 안되어있음

이미지

- 안드로이드 3배수 1벌, iOS 2벌(2, 3배수)
