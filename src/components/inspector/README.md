# Inspector 컴포넌트 시스템 개발 문서

Figma 플러그인의 컴포넌트 분석 및 편집 기능을 담당하는 UI 컴포넌트 시스템입니다.

## 📁 파일 구조

```
inspector/
├── README.md                 # 이 문서
├── UtilInspector.tsx         # 메인 컨테이너 컴포넌트 (Smart Component)
├── ComponentInfo.tsx         # 컴포넌트 기본 정보 표시 (Dumb Component)
├── NodeStructure.tsx         # 노드 구조 트리 표시 (Dumb Component)
├── TextLayersView.tsx        # 텍스트 레이어 전용 뷰 (Dumb Component)
├── SimplifyView.tsx          # 불필요한 레이어 정리 뷰 (Dumb Component)
├── SimplifyLayerItem.tsx     # 단순화 레이어 아이템 (Dumb Component)
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

### 1. 노드 분석 요청

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

### 5. 가시성 토글

```
사용자 클릭 → NodeStructure → UtilInspector → emit("TOGGLE_VISIBILITY") → main.ts → componentHandlers.ts
```

### 6. 잠금 토글

```
사용자 클릭 → NodeStructure → UtilInspector → emit("TOGGLE_LOCK") → main.ts → componentHandlers.ts
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
- `handleToggleVisibility()`: 가시성 토글 핸들러
- `handleToggleLock()`: 잠금 토글 핸들러

**이벤트 처리**:

- `COMPONENT_SELECTION_CHANGED`: 컴포넌트 선택 변경
- `COMPONENT_ANALYSIS_RESULT`: 분석 결과 수신
- `COMPONENT_ANALYSIS_ERROR`: 분석 에러
- `RENAME_NODE_SUCCESS/ERROR`: 이름 변경 결과
- `CHANGE_TEXT_SUCCESS/ERROR`: 텍스트 변경 결과
- `TOGGLE_VISIBILITY_SUCCESS/ERROR`: 가시성 토글 결과
- `TOGGLE_LOCK_SUCCESS/ERROR`: 잠금 토글 결과

### ComponentInfo.tsx (컴포넌트 정보)

**역할**: 선택된 노드의 기본 정보 표시

**표시 정보**:

- 노드 이름
- 타입 (FRAME/GROUP/COMPONENT/INSTANCE/SECTION)
- 크기 (width × height)
- 분석 상태

### NodeStructure.tsx (노드 구조)

**역할**: 노드의 계층적 구조를 트리 형태로 표시

**주요 기능**:

- 재귀적 노드 렌더링
- 노드 타입별 아이콘 표시
- 펼치기/접기 기능
- 인라인 편집 (이름/텍스트)
- 가시성 토글
- 잠금 토글
- Auto Layout 정보 표시

**노드 타입별 아이콘**:

- `INSTANCE`: LuDiamond
- `FRAME`: LuFrame
- `GROUP`: LuLayers
- `RECTANGLE`: LuSquare
- `ELLIPSE`: LuCircle
- `TEXT`: LuType
- `IMAGE`: LuImage

**Props**:

- `node`: 노드 데이터
- `depth`: 현재 깊이
- `isRoot`: 루트 노드 여부
- `expandedNodes`: 펼쳐진 노드 Set
- `editingNodeId`: 편집 중인 노드 ID
- `editingName`: 편집 중인 텍스트
- `onToggleNode`: 노드 토글 콜백
- `onStartEditing`: 편집 시작 콜백
- `onSaveNameChange`: 이름 저장 콜백
- `onCancelEditing`: 편집 취소 콜백
- `onSetEditingName`: 텍스트 변경 콜백
- `onHandleKeyDown`: 키보드 이벤트 콜백
- `onStartTextEditing`: 텍스트 편집 시작 콜백
- `onSaveTextChange`: 텍스트 저장 콜백
- `onToggleVisibility`: 가시성 토글 콜백
- `onToggleLock`: 잠금 토글 콜백

### TextLayersView.tsx (텍스트 레이어 뷰)

**역할**: 텍스트 레이어만 모아서 표시하는 전용 뷰

**주요 기능**:

- Y 좌표 기준 정렬 (위→아래)
- 레이어 이름과 텍스트 내용 편집
- 구조적 배치 유지

**Props**:

- `textLayers`: 텍스트 레이어 배열
- `editingNodeId`: 편집 중인 노드 ID
- `editingName`: 편집 중인 텍스트
- `onStartEditing`: 편집 시작 콜백
- `onSaveNameChange`: 이름 저장 콜백
- `onCancelEditing`: 편집 취소 콜백
- `onSetEditingName`: 텍스트 변경 콜백
- `onHandleKeyDown`: 키보드 이벤트 콜백
- `onStartTextEditing`: 텍스트 편집 시작 콜백
- `onSaveTextChange`: 텍스트 저장 콜백
- `onHandleTextKeyDown`: 텍스트 키보드 이벤트 콜백

### SimplifyView.tsx (불필요한 레이어 정리)

**역할**: 컴포넌트 내 불필요한 레이어를 감지하고 정리하는 기능

**주요 기능**:

- **불필요한 레이어 감지**:

  - 숨겨진 레이어 (visible: false)
  - 빈 텍스트 레이어 (내용이 비어있거나 공백만 있는 경우)
  - 크기가 0인 레이어 (width 또는 height가 0)
  - 빈 컨테이너 (자식이 없는 FRAME, GROUP 등)

- **일괄 선택/해제**: 전체 선택 또는 개별 선택
- **일괄 작업**: 선택된 레이어들을 한 번에 숨김 해제/숨김/삭제
- **개별 작업**: 각 레이어별로 가시성 토글 또는 삭제
- **실시간 분석**: 컴포넌트 변경 시 자동으로 다시 분석

**Props**:

- `analysis`: 분석된 컴포넌트 데이터
- `onToggleVisibility`: 가시성 토글 콜백
- `onDeleteLayer`: 레이어 삭제 콜백

**감지 기준**:

1. **숨겨진 레이어**: `visible: false`인 모든 레이어
2. **빈 텍스트 레이어**: TEXT 타입이지만 내용이 비어있거나 공백만 있는 경우
3. **크기가 0인 레이어**: width 또는 height가 0인 레이어
4. **빈 컨테이너**: FRAME, GROUP 타입이지만 자식이 없는 경우

### SimplifyLayerItem.tsx (단순화 레이어 아이템)

**역할**: 개별 불필요한 레이어를 표시하고 관리하는 컴포넌트

**주요 기능**:

- **레이어 정보 표시**: 이름, 타입, 이유, 깊이, 가시성, 잠금 상태
- **선택 관리**: 체크박스를 통한 개별 선택/해제
- **가시성 토글**: 눈 아이콘을 통한 숨김/보이기 토글
- **삭제 기능**: 휴지통 아이콘을 통한 레이어 삭제
- **이유별 아이콘**: 각 불필요한 이유에 따른 시각적 구분

**Props**:

- `layer`: 불필요한 레이어 데이터
- `isSelected`: 선택 상태
- `onToggleSelection`: 선택 토글 콜백
- `onToggleVisibility`: 가시성 토글 콜백
- `onDeleteLayer`: 레이어 삭제 콜백
- `onUpdateLayerVisibility`: 레이어 가시성 업데이트 콜백

**시각적 구분**:

- **숨겨진 레이어**: 회색 눈 아이콘
- **빈 텍스트 레이어**: 노란색 경고 아이콘
- **크기가 0인 레이어**: 빨간색 경고 아이콘
- **빈 컨테이너**: 주황색 경고 아이콘

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
- `placeholder`: 플레이스홀더 텍스트
- `className`: 컨테이너 클래스
- `editingClassName`: 편집 모드 클래스
- `displayClassName`: 표시 모드 클래스
- `title`: 툴팁 텍스트

## 🎯 주요 기능

### 1. 탭 시스템

- **구조 탭**: 전체 노드 구조 표시 (자식 요소를 가진 모든 레이어 지원)
- **텍스트 탭**: 텍스트 레이어만 모아서 표시
- **단순화 탭**: 불필요한 레이어 감지 및 정리 기능
  - 숨겨진 레이어, 빈 텍스트, 크기 0, 빈 컨테이너 감지
  - 일괄 숨김 해제/숨김/삭제 기능
  - 개별 레이어별 가시성 토글 및 삭제

### 2. 편집 기능

- **이름 편집**: 노드/레이어 이름 변경
- **텍스트 편집**: TEXT 타입 노드의 텍스트 내용 변경
- **실시간 동기화**: 편집 결과가 Figma와 플러그인에서 즉시 반영

### 3. 구조 탐색

- **자동 펼치기**: 루트부터 3depth까지 자동 펼침
- **수동 토글**: 화살표 클릭으로 노드 펼치기/접기
- **가시성 토글**: 노드의 보이기/숨기기
- **잠금 토글**: 노드의 잠그기/잠금 해제

### 4. 시각적 표현

- **노드 타입별 아이콘**: 각 노드 타입을 구분하는 아이콘
- **Auto Layout 정보**: FRAME/COMPONENT/INSTANCE의 레이아웃 모드, 간격, 패딩, 정렬 정보 표시
  - 레이아웃 모드: 가로/세로/그리드
  - 간격: 자식 요소 간의 간격
  - 패딩: 상/우/하/좌 패딩 값
  - 정렬: 주축/교차축 정렬 방식
  - 래핑: 자식 요소 래핑 여부
- **편집 상태 표시**: 편집 중인 필드의 테두리 색상으로 구분
- **상태 아이콘**: 가시성(눈), 잠금(자물쇠) 상태 표시

## 🔧 이벤트 시스템

### UI → Main 통신 (emit)

| 이벤트              | 파라미터                            | 설명                  |
| ------------------- | ----------------------------------- | --------------------- |
| `ANALYZE_COMPONENT` | `componentId: string`               | 노드 분석 요청        |
| `RENAME_NODE`       | `{nodeId: string, newName: string}` | 노드 이름 변경 요청   |
| `CHANGE_TEXT`       | `{nodeId: string, newText: string}` | 텍스트 내용 변경 요청 |
| `TOGGLE_VISIBILITY` | `nodeId: string`                    | 노드 가시성 토글 요청 |
| `TOGGLE_LOCK`       | `nodeId: string`                    | 노드 잠금 토글 요청   |
| `DELETE_LAYER`      | `nodeId: string`                    | 레이어 삭제 요청      |

### Main → UI 통신 (postMessage)

| 이벤트                        | 데이터                                               | 설명             |
| ----------------------------- | ---------------------------------------------------- | ---------------- |
| `COMPONENT_SELECTION_CHANGED` | `component: ComponentData`                           | 노드 선택 변경   |
| `COMPONENT_ANALYSIS_RESULT`   | `data: ComponentAnalysis`                            | 분석 결과 전달   |
| `COMPONENT_ANALYSIS_ERROR`    | `{error: string}`                                    | 분석 에러        |
| `RENAME_NODE_SUCCESS`         | `{nodeId: string, oldName: string, newName: string}` | 이름 변경 성공   |
| `RENAME_NODE_ERROR`           | `{error: string}`                                    | 이름 변경 실패   |
| `CHANGE_TEXT_SUCCESS`         | `{nodeId: string, oldText: string, newText: string}` | 텍스트 변경 성공 |
| `CHANGE_TEXT_ERROR`           | `{error: string}`                                    | 텍스트 변경 실패 |
| `TOGGLE_VISIBILITY_SUCCESS`   | `{nodeId: string, visible: boolean}`                 | 가시성 토글 성공 |
| `TOGGLE_VISIBILITY_ERROR`     | `{error: string}`                                    | 가시성 토글 실패 |
| `TOGGLE_LOCK_SUCCESS`         | `{nodeId: string, locked: boolean}`                  | 잠금 토글 성공   |
| `TOGGLE_LOCK_ERROR`           | `{error: string}`                                    | 잠금 토글 실패   |
| `DELETE_LAYER_SUCCESS`        | `{nodeId: string, name: string}`                     | 레이어 삭제 성공 |
| `DELETE_LAYER_ERROR`          | `{error: string}`                                    | 레이어 삭제 실패 |

## 🎨 스타일링

모든 컴포넌트는 **Tailwind CSS**를 사용하여 스타일링됩니다.

**주요 스타일 클래스**:

- `border-blue-500`: 이름 편집 모드
- `border-green-500`: 텍스트 편집 모드
- `bg-gray-100`: 루트 노드 배경
- `bg-gray-50`: 일반 노드 배경
- `text-blue-600`: 텍스트 내용 색상
- `text-gray-500`: 레이어 이름 색상
- `hover:text-gray-700`: 버튼 호버 효과
- `transition-colors`: 색상 전환 애니메이션

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

### 새로운 토글 기능 추가

1. 새로운 토글 핸들러 함수 추가
2. 새로운 이벤트 타입 정의
3. UI에 토글 버튼 추가

## 🔍 디버깅

### 콘솔 로그

각 주요 함수에 디버깅 로그가 추가되어 있습니다:

**UtilInspector.tsx**:

- `[UtilInspector] Starting name editing`
- `[UtilInspector] Starting text editing`
- `[UtilInspector] Saving name change`
- `[UtilInspector] Saving text change`
- `[UtilInspector] TOGGLE_LOCK_SUCCESS received`
- `[UtilInspector] DELETE_LAYER_SUCCESS received`
- `[UtilInspector] Updating node lock`

**NodeStructure.tsx**:

- `[NodeStructure] Lock button clicked`

**componentHandlers.ts**:

- `[LOCK] Starting lock toggle`
- `[LOCK] Node found`
- `[LOCK] Lock toggled`
- `[LOCK] Sending success message`
- `[DELETE] Starting layer deletion`
- `[DELETE] Node found`
- `[DELETE] Node deleted successfully`

### 문제 해결

1. **편집 모드가 시작되지 않음**: `onStartEditing` 콜백 확인
2. **저장이 되지 않음**: `onSaveChange` 콜백 및 이벤트 전송 확인
3. **상태가 동기화되지 않음**: `postMessage` 이벤트 수신 확인
4. **아이콘이 변경되지 않음**: 노드 데이터의 `locked` 속성 확인

## 📝 사용 예시

### UtilInspector 사용

```tsx
<UtilInspector />
```

### EditableText 사용

```tsx
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

### NodeStructure 사용

```tsx
<NodeStructure
  node={nodeData}
  depth={0}
  isRoot={true}
  expandedNodes={expandedNodes}
  editingNodeId={editingNodeId}
  editingName={editingName}
  onToggleNode={handleToggleNode}
  onStartEditing={handleStartEditing}
  onSaveNameChange={handleSaveNameChange}
  onCancelEditing={handleCancelEditing}
  onSetEditingName={setEditingName}
  onHandleKeyDown={handleKeyDown}
  onStartTextEditing={handleStartTextEditing}
  onSaveTextChange={handleSaveTextChange}
  onToggleVisibility={handleToggleVisibility}
  onToggleLock={handleToggleLock}
/>
```

## 🔧 개발 가이드

### 새로운 기능 추가 시 체크리스트

1. **이벤트 정의**: UI ↔ Main 통신 이벤트 타입 정의
2. **핸들러 구현**: `componentHandlers.ts`에 핸들러 함수 구현
3. **이벤트 등록**: `main.ts`에 이벤트 리스너 등록
4. **UI 컴포넌트**: 필요한 UI 컴포넌트 구현
5. **상태 관리**: `UtilInspector.tsx`에 상태 및 핸들러 추가
6. **Props 전달**: 모든 하위 컴포넌트에 필요한 props 전달
7. **디버깅 로그**: 개발 및 디버깅을 위한 로그 추가
8. **에러 처리**: 성공/실패 케이스 모두 처리
9. **문서 업데이트**: README.md에 새로운 기능 문서화

### 코드 스타일 가이드

- **함수명**: `handle` + 기능명 (예: `handleToggleLock`)
- **이벤트명**: `대문자_언더스코어` (예: `TOGGLE_LOCK`)
- **상태명**: `camelCase` (예: `editingNodeId`)
- **Props명**: `on` + 동작명 (예: `onToggleLock`)

이 시스템은 모듈화된 구조로 설계되어 있어 유지보수와 확장이 용이하며, 사용자에게 직관적이고 강력한 컴포넌트 편집 경험을 제공합니다.
