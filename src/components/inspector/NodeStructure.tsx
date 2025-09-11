import { h } from "preact";
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
  LuLockKeyhole,
  LuLockKeyholeOpen,
  LuSquareDashed,
  LuColumns2,
  LuRows2,
} from "react-icons/lu";
import EditableText from "./EditableText";

// 노드 타입별 아이콘 매핑 함수
const getNodeIcon = (nodeType: string, node?: any) => {
  const iconMap: Record<string, any> = {
    INSTANCE: LuDiamond,
    FRAME: LuFrame,
    GROUP: LuSquareDashed,
    RECTANGLE: LuSquare,
    ELLIPSE: LuCircle,
    TEXT: LuType,
    IMAGE: LuImage,
  };

  let IconComponent = iconMap[nodeType];

  // Auto Layout이 적용된 FRAME의 경우 레이아웃 방향에 따라 아이콘 변경
  if (
    nodeType === "FRAME" &&
    node?.layout?.layoutMode &&
    node.layout.layoutMode !== "NONE"
  ) {
    if (node.layout.layoutMode === "HORIZONTAL") {
      IconComponent = LuColumns2;
    } else if (node.layout.layoutMode === "VERTICAL") {
      IconComponent = LuRows2;
    }
  }

  return IconComponent ? (
    <IconComponent className="w-3 h-3 text-blue-600" />
  ) : null;
};

// Auto Layout 정보 표시 함수 (간소화)
const getLayoutInfo = (node: any) => {
  if (!node.layout || node.layout.layoutMode === "NONE") {
    return null;
  }

  const { layout } = node;

  // 간격이나 패딩이 있는 경우에만 간단히 표시
  const hasSpacing = layout.itemSpacing > 0;
  const hasPadding =
    layout.paddingTop > 0 ||
    layout.paddingRight > 0 ||
    layout.paddingBottom > 0 ||
    layout.paddingLeft > 0;

  if (!hasSpacing && !hasPadding) {
    return null;
  }

  return (
    <div className="text-xs text-gray-500 mt-1">
      {hasSpacing && <span>간격: {layout.itemSpacing}px</span>}
      {hasSpacing && hasPadding && <span className="mx-1">•</span>}
      {hasPadding && <span>패딩 있음</span>}
    </div>
  );
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
  onToggleLock: (nodeId: string) => void;
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
  onToggleLock,
}: NodeStructureProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = isRoot || expandedNodes.has(node.id);
  const canToggle = hasChildren && !isRoot;

  return (
    <div key={node.id} className="mb-1">
      <div
        className={`px-2 py-1 border border-gray-300 rounded text-xs flex items-center gap-2 ${
          depth === 0 ? "bg-gray-100" : depth === 1 ? "bg-white" : "bg-gray-50"
        }`}
        style={{ marginLeft: depth === 0 ? "0px" : "0px" }}
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
            {getNodeIcon(node.type, node)}
            <div className="flex-1 flex justify-between">
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
              {canToggle && (
                <div className="flex gap-1">
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
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("[NodeStructure] Lock button clicked:", {
                        nodeId: node.id,
                        currentLocked: node.locked,
                      });
                      onToggleLock(node.id);
                    }}
                    title={node.locked ? "잠금 해제" : "잠그기"}
                  >
                    {node.locked ? (
                      <LuLockKeyhole className="w-3 h-3" />
                    ) : (
                      <LuLockKeyholeOpen className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* <div className="mt-1">
            <div className="text-xs text-gray-500">타입: {node.type}</div>
            {getLayoutInfo(node)}
          </div> */}

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
        <div className="mt-2 border-gray-200">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 space-y-1 shadow-sm">
            <div className="text-xs text-gray-600 font-medium mb-2 pb-1 border-b border-gray-200">
              자식 요소 ({node.children.length}개)
            </div>
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
                onToggleLock={onToggleLock}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
