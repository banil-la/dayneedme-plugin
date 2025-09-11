import { h } from "preact";
import { useGlobal } from "../../context/GlobalContext";
import { emit } from "@create-figma-plugin/utilities";
import { useEffect, useState, useRef, useCallback } from "preact/hooks";
import ComponentInfoDisplay from "./ComponentInfo";
import AnalysisResult from "./AnalysisResult";

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
        <h3 className="text-lg font-semibold mb-4">컴포넌트 검사기</h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-600">
          <p>검사를 위한 컴포넌트를 선택해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">컴포넌트 검사기</h3>

      <ComponentInfoDisplay
        component={selectedComponent}
        analyzing={analyzing}
      />

      {analysis && (
        <AnalysisResult
          analysis={analysis}
          expandedNodes={expandedNodes}
          editingNodeId={editingNodeId}
          editingName={editingName}
          onToggleNode={toggleNode}
          onStartEditing={startEditing}
          onSaveNameChange={saveNameChange}
          onCancelEditing={cancelEditing}
          onSetEditingName={setEditingName}
          onHandleKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
}
