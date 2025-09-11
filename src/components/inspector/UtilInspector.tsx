import { h } from "preact";
import { useGlobal } from "../../context/GlobalContext";
import { emit } from "@create-figma-plugin/utilities";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import ComponentInfoDisplay from "./ComponentInfo";
import NodeStructure from "./NodeStructure";
import TextLayersView from "./TextLayersView";
import SimplifyView from "./SimplifyView";

interface ComponentInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  width: number;
  height: number;
  x: number;
  y: number;
  visible: boolean;
  locked: boolean;
}

interface ComponentAnalysis {
  component: ComponentInfo;
  structure: any;
  totalNodes: number;
  nodeTypes: Record<string, number>;
}

export default function UtilInspector() {
  const { mode } = useGlobal();
  const [selectedComponent, setSelectedComponent] =
    useState<ComponentInfo | null>(null);
  const [analysis, setAnalysis] = useState<ComponentAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"structure" | "text" | "simplify">(
    "structure"
  );
  const [unnecessaryLayerCount, setUnnecessaryLayerCount] = useState<number>(0);

  // 최신 상태를 참조하기 위한 ref
  const analysisRef = useRef<ComponentAnalysis | null>(null);
  const selectedComponentRef = useRef<ComponentInfo | null>(null);

  // ref 업데이트
  analysisRef.current = analysis;
  selectedComponentRef.current = selectedComponent;

  // 노드 접힘/펼치기 토글 함수
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // 이름 편집 시작
  const startEditing = (nodeId: string, currentName: string) => {
    console.log("[UtilInspector] Starting name editing:", {
      nodeId,
      currentName,
    });
    setEditingNodeId(nodeId);
    setEditingName(currentName);
  };

  // 이름 편집 취소
  const cancelEditing = () => {
    setEditingNodeId(null);
    setEditingName("");
  };

  // 이름 변경 저장
  const saveNameChange = (nodeId: string) => {
    console.log("[UtilInspector] Saving name change:", {
      nodeId,
      newName: editingName.trim(),
    });
    if (editingName.trim() && editingName !== "") {
      emit("RENAME_NODE", { nodeId, newName: editingName.trim() });
    }
    cancelEditing();
  };

  // Enter 키로 저장, Escape 키로 취소
  const handleKeyDown = (e: KeyboardEvent, nodeId: string) => {
    if (e.key === "Enter") {
      saveNameChange(nodeId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  // 키보드 이벤트 핸들러 (텍스트 편집용)
  const handleTextKeyDown = (e: KeyboardEvent, nodeId: string) => {
    if (e.key === "Enter") {
      saveTextChange(nodeId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  // 텍스트 편집 시작
  const startTextEditing = (nodeId: string, currentText: string) => {
    console.log("[UtilInspector] Starting text editing:", {
      nodeId,
      currentText,
    });
    setEditingNodeId(`${nodeId}_text`);
    setEditingName(currentText);
  };

  // 텍스트 변경 저장
  const saveTextChange = (nodeId: string) => {
    console.log("[UtilInspector] Saving text change:", {
      nodeId,
      newText: editingName.trim(),
    });
    if (editingName.trim() && editingName !== "") {
      emit("CHANGE_TEXT", { nodeId, newText: editingName.trim() });
    }
    cancelEditing();
  };

  // 가시성 토글 핸들러
  const handleToggleVisibility = (nodeId: string) => {
    emit("TOGGLE_VISIBILITY", nodeId);
  };

  // 잠금 토글 핸들러
  const handleToggleLock = (nodeId: string) => {
    emit("TOGGLE_LOCK", nodeId);
  };

  // 텍스트 레이어만 추출하는 함수
  const extractTextLayers = (node: any): any[] => {
    const textLayers: any[] = [];

    const traverse = (currentNode: any) => {
      if (currentNode.type === "TEXT" && currentNode.text) {
        textLayers.push({
          ...currentNode,
          // 위치 정보를 상대적으로 계산
          relativeX: currentNode.x,
          relativeY: currentNode.y,
        });
      }

      if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(traverse);
      }
    };

    traverse(node);
    return textLayers;
  };

  // 3depth까지 자동으로 펼치는 함수
  const expandNodesToDepth = (
    node: any,
    depth: number = 0,
    maxDepth: number = 3
  ): Set<string> => {
    const expandedSet = new Set<string>();

    if (depth < maxDepth && node.children && node.children.length > 0) {
      expandedSet.add(node.id);

      node.children.forEach((child: any) => {
        const childExpanded = expandNodesToDepth(child, depth + 1, maxDepth);
        childExpanded.forEach((id) => expandedSet.add(id));
      });
    }

    return expandedSet;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message || typeof message !== "object") return;

      if (message.type === "COMPONENT_SELECTION_CHANGED") {
        setSelectedComponent(message.data);
        setAnalysis(null); // 선택이 바뀌면 분석 결과 초기화

        // 컴포넌트가 선택되면 자동으로 분석 시작
        if (message.data) {
          setAnalyzing(true);
          emit("ANALYZE_COMPONENT", message.data.id);
        }
      } else if (message.type === "COMPONENT_ANALYSIS_RESULT") {
        setAnalysis(message.data);
        setAnalyzing(false);

        // 분석 결과 로드 시 3depth까지 자동으로 펼치기
        if (message.data && message.data.structure) {
          const autoExpandedNodes = expandNodesToDepth(message.data.structure);
          setExpandedNodes(autoExpandedNodes);
        }
      } else if (message.type === "COMPONENT_ANALYSIS_ERROR") {
        setAnalyzing(false);
      } else if (message.type === "RENAME_NODE_SUCCESS") {
        // 로컬 상태에서 해당 노드의 이름만 업데이트
        const currentAnalysis = analysisRef.current;
        if (currentAnalysis) {
          const updateNodeName = (node: any): any => {
            if (node.id === message.data.nodeId) {
              return { ...node, name: message.data.newName };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: node.children.map(updateNodeName),
              };
            }
            return node;
          };

          const updatedAnalysis = {
            ...currentAnalysis,
            structure: updateNodeName(currentAnalysis.structure),
          };
          setAnalysis(updatedAnalysis);
        }
      } else if (message.type === "RENAME_NODE_ERROR") {
        cancelEditing();
      } else if (message.type === "CHANGE_TEXT_SUCCESS") {
        // 로컬 상태에서 해당 노드의 텍스트만 업데이트
        const currentAnalysis = analysisRef.current;
        if (currentAnalysis) {
          const updateNodeText = (node: any): any => {
            if (node.id === message.data.nodeId) {
              return { ...node, text: message.data.newText };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: node.children.map(updateNodeText),
              };
            }
            return node;
          };

          const updatedAnalysis = {
            ...currentAnalysis,
            structure: updateNodeText(currentAnalysis.structure),
          };
          setAnalysis(updatedAnalysis);
        }
      } else if (message.type === "CHANGE_TEXT_ERROR") {
        cancelEditing();
      } else if (message.type === "TOGGLE_VISIBILITY_SUCCESS") {
        // 로컬 상태에서 해당 노드의 가시성만 업데이트
        const currentAnalysis = analysisRef.current;
        if (currentAnalysis) {
          const updateNodeVisibility = (node: any): any => {
            if (node.id === message.data.nodeId) {
              return { ...node, visible: message.data.visible };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: node.children.map(updateNodeVisibility),
              };
            }
            return node;
          };

          const updatedAnalysis = {
            ...currentAnalysis,
            structure: updateNodeVisibility(currentAnalysis.structure),
          };
          setAnalysis(updatedAnalysis);
        }
      } else if (message.type === "TOGGLE_VISIBILITY_ERROR") {
        // 에러 처리 (필요시 알림 표시)
        console.error("Visibility toggle failed:", message.error);
      } else if (message.type === "TOGGLE_LOCK_SUCCESS") {
        // 로컬 상태에서 해당 노드의 잠금 상태만 업데이트
        console.log(
          "[UtilInspector] TOGGLE_LOCK_SUCCESS received:",
          message.data
        );
        const currentAnalysis = analysisRef.current;
        if (currentAnalysis) {
          const updateNodeLock = (node: any): any => {
            if (node.id === message.data.nodeId) {
              console.log("[UtilInspector] Updating node lock:", {
                nodeId: node.id,
                oldLocked: node.locked,
                newLocked: message.data.locked,
              });
              return { ...node, locked: message.data.locked };
            }
            if (node.children && node.children.length > 0) {
              return {
                ...node,
                children: node.children.map(updateNodeLock),
              };
            }
            return node;
          };

          const updatedAnalysis = {
            ...currentAnalysis,
            structure: updateNodeLock(currentAnalysis.structure),
          };
          console.log(
            "[UtilInspector] Setting updated analysis with lock change"
          );
          setAnalysis(updatedAnalysis);
        } else {
          console.log(
            "[UtilInspector] No current analysis found for lock update"
          );
        }
      } else if (message.type === "TOGGLE_LOCK_ERROR") {
        // 에러 처리 (필요시 알림 표시)
        console.error("Lock toggle failed:", message.error);
      } else if (message.type === "DELETE_LAYER_SUCCESS") {
        // 레이어 삭제 성공 시 SimplifyView에서 자체적으로 처리하므로 분석 재실행하지 않음
        console.log(
          "[UtilInspector] DELETE_LAYER_SUCCESS received:",
          message.data
        );
      } else if (message.type === "DELETE_LAYER_ERROR") {
        // 에러 처리 (필요시 알림 표시)
        console.error("Layer deletion failed:", message.error);
      }
    };

    window.addEventListener("message", handleMessage);
    // 초기 선택 상태 확인을 위해 checkSelection 트리거
    parent.postMessage({ pluginMessage: { type: "CHECK_SELECTION" } }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!selectedComponent) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">빠르게 편집하기</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-600">
          <p>구조 분석을 위해 자식 요소를 가진 레이어를 선택해 주세요.</p>
          <p className="text-xs mt-2 text-gray-500">
            (FRAME, GROUP, COMPONENT, INSTANCE, SECTION 등)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4 pt-2">
      {analysis && (
        <div>
          {/* 탭 UI */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "structure"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("structure")}
            >
              구조
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "text"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("text")}
            >
              텍스트 ({extractTextLayers(analysis.structure).length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "simplify"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("simplify")}
            >
              <div className="flex items-center gap-2">
                단순화
                {unnecessaryLayerCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unnecessaryLayerCount}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* 탭 내용 */}
          {activeTab === "structure" && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <NodeStructure
                node={analysis.structure}
                depth={0}
                isRoot={true}
                expandedNodes={expandedNodes}
                editingNodeId={editingNodeId}
                editingName={editingName}
                onToggleNode={toggleNode}
                onStartEditing={startEditing}
                onSaveNameChange={saveNameChange}
                onCancelEditing={cancelEditing}
                onSetEditingName={setEditingName}
                onHandleKeyDown={handleKeyDown}
                onStartTextEditing={startTextEditing}
                onSaveTextChange={saveTextChange}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
              />
            </div>
          )}

          {activeTab === "text" && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-xs text-gray-600 mb-3">
                텍스트 레이어: {extractTextLayers(analysis.structure).length}개
              </div>
              <TextLayersView
                textLayers={extractTextLayers(analysis.structure)}
                editingNodeId={editingNodeId}
                editingName={editingName}
                onStartTextEditing={startTextEditing}
                onSaveTextChange={saveTextChange}
                onStartEditing={startEditing}
                onSaveNameChange={saveNameChange}
                onCancelEditing={cancelEditing}
                onSetEditingName={setEditingName}
                onHandleKeyDown={handleKeyDown}
                onHandleTextKeyDown={handleTextKeyDown}
              />
            </div>
          )}

          {activeTab === "simplify" && (
            <SimplifyView
              analysis={analysis}
              onToggleVisibility={handleToggleVisibility}
              onDeleteLayer={(nodeId) => {
                emit("DELETE_LAYER", nodeId);
              }}
              onLayerCountChange={setUnnecessaryLayerCount}
            />
          )}
        </div>
      )}
    </div>
  );
}
