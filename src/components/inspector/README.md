# Inspector 컴포넌트 시스템

Figma 플러그인의 컴포넌트 분석 및 편집 기능을 담당하는 UI 컴포넌트 시스템입니다.

## 📁 파일 구조

```
inspector/
├── README.md                 # 이 문서
├── UtilInspector.tsx         # 메인 컨테이너 컴포넌트 (Smart Component)
├── ComponentInfo.tsx         # 컴포넌트 기본 정보 표시 (Dumb Component)
├── AnalysisResult.tsx        # 분석 결과 요약 표시 (Dumb Component)
├── NodeStructure.tsx         # 노드 구조 트리 표시 (Dumb Component)
├── TextLayersView.tsx        # 텍스트 레이어 전용 뷰 (Dumb Component)
└── EditableText.tsx          # 공통 편집 컴포넌트 (Dumb Component)
```

## 🏗️ 아키텍처

### Smart vs Dumb Components

- **Smart Component**: `UtilInspector.tsx`

  - 상태 관리 및 비즈니스 로직 담당
  - Figma API와의 통신 처리
  - 이벤트 핸들링 및 데이터 변환

- **Dumb Components**: 나머지 모든 컴포넌트
  - Props를 통한 데이터 표시
  - 사용자 인터랙션을 부모 컴포넌트로 전달
  - 재사용 가능한 UI 컴포넌트

## 🔄 데이터 흐름

### 1. 컴포넌트 분석 요청

```
사용자 선택 → UtilInspector → emit("ANALYZE_COMPONENT") → main.ts → componentHandlers.ts
```

### 2. 분석 결과 수신

```
componentHandlers.ts → postMessage("COMPONENT_ANALYSIS_RESULT") → UtilInspector → 상태 업데이트
```

### 3. 편집 요청

```
사용자 편집 → EditableText → UtilInspector → emit("RENAME_NODE"/"CHANGE_TEXT") → main.ts → componentHandlers.ts
```

### 4. 편집 결과 수신

```
componentHandlers.ts → postMessage("RENAME_NODE_SUCCESS"/"CHANGE_TEXT_SUCCESS") → UtilInspector → 로컬 상태 업데이트
```

## 🧩 컴포넌트 상세

### UtilInspector.tsx (메인 컨테이너)

**역할**: 전체 inspector 기능의 상태 관리 및 조율

**주요 상태**:

- `selectedComponent`: 선택된 컴포넌트 정보
- `analysis`: 컴포넌트 분석 결과
- `expandedNodes`: 펼쳐진 노드들의 Set
- `editingNodeId`: 현재 편집 중인 노드 ID
- `editingName`: 편집 중인 텍스트
- `activeTab`: 활성 탭 ("structure" | "text")

**주요 함수**:

- `extractTextLayers()`: 텍스트 레이어만 추출
- `expandNodesToDepth()`: 노드를 지정된 깊이까지 자동 펼치기
- `startEditing()`: 이름 편집 시작
- `startTextEditing()`: 텍스트 편집 시작
- `saveNameChange()`: 이름 변경 저장
- `saveTextChange()`: 텍스트 변경 저장

### ComponentInfo.tsx (컴포넌트 정보)

**역할**: 선택된 컴포넌트의 기본 정보 표시

**표시 정보**:

- 컴포넌트 이름
- 타입 (COMPONENT/INSTANCE)
- 크기 (width × height)
- 분석 상태

### AnalysisResult.tsx (분석 결과)

**역할**: 컴포넌트 분석 결과의 요약 정보 표시

**표시 정보**:

- 총 노드 수
- 노드 타입별 통계
- NodeStructure 컴포넌트 렌더링

### NodeStructure.tsx (노드 구조)

**역할**: 컴포넌트의 계층적 구조를 트리 형태로 표시

**주요 기능**:

- 재귀적 노드 렌더링
- 노드 타입별 아이콘 표시
- 펼치기/접기 기능
- 인라인 편집 (이름/텍스트)
- 가시성 토글
- Auto Layout 정보 표시

**노드 타입별 아이콘**:

- `INSTANCE`: LuDiamond
- `FRAME`: LuFrame
- `GROUP`: LuLayers
- `RECTANGLE`: LuSquare
- `ELLIPSE`: LuCircle
- `TEXT`: LuType
- `IMAGE`: LuImage

### TextLayersView.tsx (텍스트 레이어 뷰)

**역할**: 텍스트 레이어만 모아서 표시하는 전용 뷰

**주요 기능**:

- Y 좌표 기준 정렬 (위→아래)
- 레이어 이름과 텍스트 내용 편집
- 구조적 배치 유지

### EditableText.tsx (공통 편집 컴포넌트)

**역할**: 재사용 가능한 인라인 편집 컴포넌트

**주요 기능**:

- 클릭 시 편집 모드 전환
- Enter/Escape 키 처리
- 자동 텍스트 선택
- 커스터마이징 가능한 스타일

**Props**:

- `value`: 표시할 값
- `editingNodeId`: 현재 편집 중인 노드 ID
- `nodeId`: 이 컴포넌트의 노드 ID
- `editingName`: 편집 중인 텍스트
- `onStartEditing`: 편집 시작 콜백
- `onSaveChange`: 저장 콜백
- `onCancelEditing`: 취소 콜백
- `onSetEditingName`: 텍스트 변경 콜백
- `onHandleKeyDown`: 키보드 이벤트 콜백

## 🎯 주요 기능

### 1. 탭 시스템

- **구조 탭**: 전체 노드 구조 표시
- **텍스트 탭**: 텍스트 레이어만 모아서 표시

### 2. 편집 기능

- **이름 편집**: 노드/레이어 이름 변경
- **텍스트 편집**: TEXT 타입 노드의 텍스트 내용 변경
- **실시간 동기화**: 편집 결과가 Figma와 플러그인에서 즉시 반영

### 3. 구조 탐색

- **자동 펼치기**: 루트부터 3depth까지 자동 펼침
- **수동 토글**: 화살표 클릭으로 노드 펼치기/접기
- **가시성 토글**: 노드의 보이기/숨기기

### 4. 시각적 표현

- **노드 타입별 아이콘**: 각 노드 타입을 구분하는 아이콘
- **Auto Layout 정보**: 레이아웃 모드, 간격, 정렬 정보 표시
- **편집 상태 표시**: 편집 중인 필드의 테두리 색상으로 구분

## 🔧 이벤트 시스템

### UI → Main 통신 (emit)

- `ANALYZE_COMPONENT`: 컴포넌트 분석 요청
- `RENAME_NODE`: 노드 이름 변경 요청
- `CHANGE_TEXT`: 텍스트 내용 변경 요청
- `TOGGLE_VISIBILITY`: 노드 가시성 토글 요청

### Main → UI 통신 (postMessage)

- `COMPONENT_ANALYSIS_RESULT`: 분석 결과 전달
- `RENAME_NODE_SUCCESS/ERROR`: 이름 변경 결과
- `CHANGE_TEXT_SUCCESS/ERROR`: 텍스트 변경 결과
- `TOGGLE_VISIBILITY_SUCCESS/ERROR`: 가시성 토글 결과

## 🎨 스타일링

모든 컴포넌트는 **Tailwind CSS**를 사용하여 스타일링됩니다.

**주요 스타일 클래스**:

- `border-blue-500`: 이름 편집 모드
- `border-green-500`: 텍스트 편집 모드
- `bg-gray-100`: 루트 노드 배경
- `bg-gray-50`: 일반 노드 배경
- `text-blue-600`: 텍스트 내용 색상
- `text-gray-500`: 레이어 이름 색상

## 🚀 확장 가능성

### 새로운 노드 타입 추가

1. `getNodeIcon()` 함수에 새로운 타입 추가
2. 필요시 특별한 편집 로직 구현

### 새로운 편집 기능 추가

1. `EditableText` 컴포넌트 활용
2. 새로운 이벤트 타입 정의
3. `componentHandlers.ts`에 핸들러 추가

### 새로운 탭 추가

1. `activeTab` 상태에 새로운 타입 추가
2. 새로운 뷰 컴포넌트 생성
3. 탭 UI에 버튼 추가

## 🔍 디버깅

### 콘솔 로그

각 주요 함수에 디버깅 로그가 추가되어 있습니다:

- `[UtilInspector] Starting name editing`
- `[UtilInspector] Starting text editing`
- `[UtilInspector] Saving name change`
- `[UtilInspector] Saving text change`
- `[EditableText] Clicked to start editing`

### 문제 해결

1. **편집 모드가 시작되지 않음**: `onStartEditing` 콜백 확인
2. **저장이 되지 않음**: `onSaveChange` 콜백 및 이벤트 전송 확인
3. **상태가 동기화되지 않음**: `postMessage` 이벤트 수신 확인

## 📝 사용 예시

```tsx
// UtilInspector 사용
<UtilInspector />

// EditableText 사용
<EditableText
  value="레이어 이름"
  editingNodeId={editingNodeId}
  nodeId="node123"
  editingName={editingName}
  onStartEditing={handleStartEditing}
  onSaveChange={handleSaveChange}
  onCancelEditing={handleCancelEditing}
  onSetEditingName={setEditingName}
  onHandleKeyDown={handleKeyDown}
  placeholder="레이어 이름"
  editingClassName="border-blue-500"
  displayClassName="cursor-pointer hover:bg-blue-50"
  title="클릭하여 편집"
/>
```

이 시스템은 모듈화된 구조로 설계되어 있어 유지보수와 확장이 용이하며, 사용자에게 직관적이고 강력한 컴포넌트 편집 경험을 제공합니다.
