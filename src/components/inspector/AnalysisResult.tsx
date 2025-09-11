import { h } from "preact";
import NodeStructure from "./NodeStructure";

interface ComponentAnalysis {
  component: any;
  structure: any;
  totalNodes: number;
  nodeTypes: Record<string, number>;
}

interface AnalysisResultProps {
  analysis: ComponentAnalysis;
  expandedNodes: Set<string>;
  editingNodeId: string | null;
  editingName: string;
  onToggleNode: (nodeId: string) => void;
  onStartEditing: (nodeId: string, currentName: string) => void;
  onSaveNameChange: (nodeId: string) => void;
  onCancelEditing: () => void;
  onSetEditingName: (name: string) => void;
  onHandleKeyDown: (e: KeyboardEvent, nodeId: string) => void;
}

export default function AnalysisResult({
  analysis,
  expandedNodes,
  editingNodeId,
  editingName,
  onToggleNode,
  onStartEditing,
  onSaveNameChange,
  onCancelEditing,
  onSetEditingName,
  onHandleKeyDown,
}: AnalysisResultProps) {
  return (
    <div style={{ marginTop: "16px" }}>
      <div
        style={{
          padding: "12px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
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
            <NodeStructure
              node={analysis.structure}
              depth={0}
              isRoot={true}
              expandedNodes={expandedNodes}
              editingNodeId={editingNodeId}
              editingName={editingName}
              onToggleNode={onToggleNode}
              onStartEditing={onStartEditing}
              onSaveNameChange={onSaveNameChange}
              onCancelEditing={onCancelEditing}
              onSetEditingName={onSetEditingName}
              onHandleKeyDown={onHandleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
