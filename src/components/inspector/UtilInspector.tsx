import { h } from "preact";
import { useGlobal } from "../../context/GlobalContext";
import { emit } from "@create-figma-plugin/utilities";
import { useEffect, useState } from "preact/hooks";

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

  const renderNodeStructure = (node: any, depth: number = 0) => {
    return (
      <div
        key={node.id}
        style={{ marginLeft: `${depth * 16}px`, fontSize: "12px" }}
      >
        <div
          style={{
            padding: "4px 8px",
            backgroundColor: depth === 0 ? "#f0f0f0" : "#f8f8f8",
            border: "1px solid #ddd",
            borderRadius: "4px",
            margin: "2px 0",
          }}
        >
          <strong>{node.name}</strong> ({node.type})
          {node.width && node.height && (
            <span style={{ color: "#666", marginLeft: "8px" }}>
              {Math.round(node.width)}×{Math.round(node.height)}
            </span>
          )}
          {node.type === "TEXT" && node.text && (
            <div style={{ color: "#007AFF", marginTop: "4px" }}>
              "{node.text}"
            </div>
          )}
        </div>
        {node.children &&
          node.children.map((child: any) =>
            renderNodeStructure(child, depth + 1)
          )}
      </div>
    );
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

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            padding: "12px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>
            {selectedComponent.name}
          </h4>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <div>
              크기: {Math.round(selectedComponent.width)} ×{" "}
              {Math.round(selectedComponent.height)}
            </div>
            <div>
              위치: ({Math.round(selectedComponent.x)},{" "}
              {Math.round(selectedComponent.y)})
            </div>
            <div>타입: {selectedComponent.type}</div>
            <div>가시성: {selectedComponent.visible ? "보임" : "숨김"}</div>
            <div>잠금: {selectedComponent.locked ? "잠김" : "해제"}</div>
            {selectedComponent.description && (
              <div style={{ marginTop: "8px", fontStyle: "italic" }}>
                설명: {selectedComponent.description}
              </div>
            )}
          </div>
          {analyzing && (
            <div
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                borderRadius: "4px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              구조 분석 중...
            </div>
          )}
        </div>
      </div>

      <div
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
      </div>

      {analysis && (
        <div style={{ marginTop: "16px" }}>
          <h4>구조 분석 결과</h4>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
            }}
          >
            <div
              style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}
            >
              총 노드: {analysis.totalNodes}개
            </div>

            <div style={{ marginBottom: "12px" }}>
              <strong>노드 타입 통계:</strong>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {Object.entries(analysis.nodeTypes).map(([type, count]) => (
                  <span
                    key={type}
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "12px",
                      fontSize: "11px",
                    }}
                  >
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong>구조:</strong>
              <div
                style={{
                  marginTop: "8px",
                  maxHeight: "300px",
                  overflow: "auto",
                }}
              >
                {renderNodeStructure(analysis.structure)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
