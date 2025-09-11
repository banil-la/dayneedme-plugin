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
      console.log("[UtilInspector] Renaming node:", nodeId, "to:", editingName);
      console.log("[UtilInspector] Current analysis state:", analysis);
      console.log(
        "[UtilInspector] Current expanded nodes:",
        Array.from(expandedNodes)
      );
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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message || typeof message !== "object") return;

      if (message.type === "COMPONENT_SELECTION_CHANGED") {
        console.log(
          "[UtilInspector] Component selection changed:",
          message.data
        );
        setSelectedComponent(message.data);
        setAnalysis(null); // 선택이 바뀌면 분석 결과 초기화

        // 컴포넌트가 선택되면 자동으로 분석 시작
        if (message.data) {
          console.log(
            "[UtilInspector] Auto-starting analysis for selected component"
          );
          setAnalyzing(true);
          emit("ANALYZE_COMPONENT", message.data.id);
        }
      } else if (message.type === "COMPONENT_ANALYSIS_RESULT") {
        console.log(
          "[UtilInspector] Received component analysis result:",
          message.data
        );
        console.log("[UtilInspector] Analysis summary:", {
          componentName: message.data.component.name,
          totalNodes: message.data.totalNodes,
          nodeTypes: message.data.nodeTypes,
        });
        setAnalysis(message.data);
        setAnalyzing(false);
      } else if (message.type === "COMPONENT_ANALYSIS_ERROR") {
        console.error(
          "[UtilInspector] Error analyzing component:",
          message.error
        );
        setAnalyzing(false);
      } else if (message.type === "RENAME_NODE_SUCCESS") {
        console.log("[UtilInspector] Node renamed successfully:", message.data);
        // 로컬 상태에서 해당 노드의 이름만 업데이트
        const currentAnalysis = analysisRef.current;
        if (currentAnalysis) {
          console.log("[UtilInspector] Updating local state for renamed node");
          console.log("[UtilInspector] Target node ID:", message.data.nodeId);
          console.log("[UtilInspector] New name:", message.data.newName);
          const updateNodeName = (node: any): any => {
            console.log(
              `[UtilInspector] Checking node: ${node.id} (${node.name})`
            );
            if (node.id === message.data.nodeId) {
              console.log(
                `[UtilInspector] ✅ Found target node! Updating: "${node.name}" → "${message.data.newName}"`
              );
              return { ...node, name: message.data.newName };
            }
            if (node.children && node.children.length > 0) {
              console.log(
                `[UtilInspector] Checking ${node.children.length} children of node: ${node.name}`
              );
              return {
                ...node,
                children: node.children.map(updateNodeName),
              };
            }
            return node;
          };

          console.log("[UtilInspector] Starting recursive update...");
          const updatedAnalysis = {
            ...currentAnalysis,
            structure: updateNodeName(currentAnalysis.structure),
          };
          setAnalysis(updatedAnalysis);
          console.log("[UtilInspector] ✅ Local state updated successfully");
        } else {
          console.log(
            "[UtilInspector] ❌ No analysis state found, cannot update"
          );
        }
      } else if (message.type === "RENAME_NODE_ERROR") {
        console.error("[UtilInspector] Error renaming node:", message.error);
        cancelEditing();
      } else {
        console.log(
          "[UtilInspector] Received unhandled message:",
          message.type
        );
      }
    };

    window.addEventListener("message", handleMessage);
    // 초기 선택 상태 확인을 위해 checkSelection 트리거
    parent.postMessage({ pluginMessage: { type: "CHECK_SELECTION" } }, "*");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!selectedComponent) {
    return (
      <div style={{ padding: "16px" }}>
        <h3>컴포넌트 검사기</h3>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p>검사를 위한 컴포넌트를 선택해 주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <h3>컴포넌트 검사기</h3>

      {/* <ComponentInfoDisplay
        component={selectedComponent}
        analyzing={analyzing}
      /> */}

      {/* <div
        style={{
          padding: "12px",
          backgroundColor: "#e3f2fd",
          border: "1px solid #bbdefb",
          borderRadius: "4px",
          fontSize: "14px",
        }}
      >
        <strong>컴포넌트가 선택되었습니다!</strong>
        <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#666" }}>
          선택된 컴포넌트의 기본 정보가 위에 표시됩니다.
        </p>
      </div> */}

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
