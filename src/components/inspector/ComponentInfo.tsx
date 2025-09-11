import { h } from "preact";

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

interface ComponentInfoProps {
  component: ComponentInfo;
  analyzing: boolean;
}

export default function ComponentInfoDisplay({
  component,
  analyzing,
}: ComponentInfoProps) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          padding: "12px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>{component.name}</h4>
        <div style={{ fontSize: "12px", color: "#666" }}>
          <div>
            크기: {Math.round(component.width)} × {Math.round(component.height)}
          </div>
          <div>
            위치: ({Math.round(component.x)}, {Math.round(component.y)})
          </div>
          <div>타입: {component.type}</div>
          <div>가시성: {component.visible ? "보임" : "숨김"}</div>
          <div>잠금: {component.locked ? "잠김" : "해제"}</div>
          {component.description && (
            <div style={{ marginTop: "8px", fontStyle: "italic" }}>
              설명: {component.description}
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
  );
}
