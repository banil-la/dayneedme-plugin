import { h } from "preact";

interface NodeStructureProps {
  node: any;
  depth?: number;
  isRoot?: boolean;
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

export default function NodeStructure({
  node,
  depth = 0,
  isRoot = false,
  expandedNodes,
  editingNodeId,
  editingName,
  onToggleNode,
  onStartEditing,
  onSaveNameChange,
  onCancelEditing,
  onSetEditingName,
  onHandleKeyDown,
}: NodeStructureProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = isRoot || expandedNodes.has(node.id);
  const canToggle = hasChildren && !isRoot;

  return (
    <div key={node.id} style={{ marginBottom: "2px" }}>
      <div
        style={{
          padding: "4px 8px",
          backgroundColor: depth === 0 ? "#f0f0f0" : "#f8f8f8",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginLeft: `${depth * 16}px`,
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* 토글 아이콘 */}
        {canToggle && (
          <span
            style={{
              fontSize: "10px",
              color: "#666",
              minWidth: "12px",
              textAlign: "center",
              cursor: "pointer",
              padding: "2px",
              borderRadius: "2px",
              transition: "background-color 0.2s",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(node.id);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e0e0e0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title="클릭하여 펼치기/접기"
          >
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {!canToggle && <span style={{ minWidth: "12px" }}></span>}

        {/* 노드 정보 */}
        <div style={{ flex: 1 }}>
          {editingNodeId === node.id ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="text"
                value={editingName}
                onChange={(e) =>
                  onSetEditingName((e.target as HTMLInputElement).value)
                }
                onKeyDown={(e) => onHandleKeyDown(e, node.id)}
                onBlur={() => {
                  // onKeyDown에서 Enter 처리하므로 onBlur에서는 처리하지 않음
                }}
                style={{
                  padding: "2px 6px",
                  border: "1px solid #007AFF",
                  borderRadius: "3px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  outline: "none",
                }}
              />
              <span style={{ fontSize: "10px", color: "#666" }}>
                ({node.type})
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong
                style={{
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => onStartEditing(node.id, node.name)}
                title="클릭하여 이름 변경"
              >
                {node.name}
              </strong>
              <span style={{ fontSize: "10px", color: "#666" }}>
                ({node.type})
              </span>
              {node.width && node.height && (
                <span style={{ color: "#666", fontSize: "10px" }}>
                  {Math.round(node.width)}×{Math.round(node.height)}
                </span>
              )}
            </div>
          )}
          {node.type === "TEXT" && node.text && (
            <div
              style={{ color: "#007AFF", marginTop: "4px", fontSize: "11px" }}
            >
              "{node.text}"
            </div>
          )}
        </div>
      </div>

      {/* 자식 노드들 */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child: any) => (
            <NodeStructure
              key={child.id}
              node={child}
              depth={depth + 1}
              isRoot={false}
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
          ))}
        </div>
      )}
    </div>
  );
}
