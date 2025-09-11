import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import {
  LuDiamond,
  LuSquare,
  LuCircle,
  LuType,
  LuImage,
  LuLayers,
  LuFrame,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";
import EditableText from "./EditableText";

// 노드 타입별 아이콘 매핑 함수
const getNodeIcon = (nodeType: string) => {
  const iconMap: Record<string, any> = {
    INSTANCE: LuDiamond,
    FRAME: LuFrame,
    GROUP: LuLayers,
    RECTANGLE: LuSquare,
    ELLIPSE: LuCircle,
    TEXT: LuType,
    IMAGE: LuImage,
  };

  const IconComponent = iconMap[nodeType];
  return IconComponent ? (
    <IconComponent className="w-3 h-3 text-blue-600" />
  ) : null;
};

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
  onStartTextEditing: (nodeId: string, currentText: string) => void;
  onSaveTextChange: (nodeId: string) => void;
  onToggleVisibility: (nodeId: string) => void;
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
  onStartTextEditing,
  onSaveTextChange,
  onToggleVisibility,
}: NodeStructureProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = isRoot || expandedNodes.has(node.id);
  const canToggle = hasChildren && !isRoot;

  return (
    <div key={node.id} className="mb-0.5">
      <div
        className={`px-2 py-1 border border-gray-300 rounded text-xs flex items-center gap-2 ${
          depth === 0 ? "bg-gray-100" : "bg-gray-50"
        }`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        {/* 토글 아이콘 */}
        {canToggle && (
          <span
            className="text-xs text-gray-600 w-3 text-center cursor-pointer p-0.5 rounded transition-colors hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(node.id);
            }}
            title="클릭하여 펼치기/접기"
          >
            {isExpanded ? "▼" : "▶"}
          </span>
        )}

        {/* 노드 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {getNodeIcon(node.type)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {node.type === "INSTANCE" ? (
                  <strong className="px-1 py-0.5 rounded transition-colors cursor-not-allowed text-gray-500">
                    {node.name}
                  </strong>
                ) : (
                  <EditableText
                    value={node.name}
                    editingNodeId={editingNodeId}
                    nodeId={node.id}
                    editingName={editingName}
                    onStartEditing={onStartEditing}
                    onSaveChange={onSaveNameChange}
                    onCancelEditing={onCancelEditing}
                    onSetEditingName={onSetEditingName}
                    onHandleKeyDown={onHandleKeyDown}
                    placeholder="레이어 이름"
                    className="flex-1"
                    editingClassName="px-1.5 py-0.5 border border-blue-500 rounded text-xs font-bold outline-none"
                    displayClassName="px-1 py-0.5 rounded transition-colors cursor-pointer hover:bg-gray-200 font-bold"
                    title="클릭하여 이름 변경"
                  />
                )}
              </div>
              <button
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(node.id);
                }}
                title={node.visible ? "숨기기" : "보이기"}
              >
                {node.visible ? (
                  <LuEye className="w-3 h-3" />
                ) : (
                  <LuEyeOff className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* TEXT 타입일 때 텍스트 편집 */}
          {node.type === "TEXT" && node.text && (
            <div className="mt-1">
              <EditableText
                value={node.text}
                editingNodeId={editingNodeId}
                nodeId={`${node.id}_text`}
                editingName={editingName}
                onStartEditing={(nodeId, currentText) =>
                  onStartTextEditing(node.id, currentText)
                }
                onSaveChange={(nodeId) => onSaveTextChange(node.id)}
                onCancelEditing={onCancelEditing}
                onSetEditingName={onSetEditingName}
                onHandleKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSaveTextChange(node.id);
                  } else if (e.key === "Escape") {
                    onCancelEditing();
                  }
                }}
                placeholder="텍스트 입력..."
                className="w-full"
                editingClassName="px-1.5 py-0.5 border border-green-500 rounded text-xs font-bold outline-none w-full"
                displayClassName="text-blue-600 text-xs cursor-pointer px-1 py-0.5 rounded transition-colors hover:bg-blue-50"
                title="클릭하여 텍스트 변경"
              />
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
              onStartTextEditing={onStartTextEditing}
              onSaveTextChange={onSaveTextChange}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
}
