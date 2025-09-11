import { h } from "preact";
import {
  LuTrash2,
  LuEyeClosed,
  LuTriangleAlert,
  LuImage,
  LuDiamond,
} from "react-icons/lu";

interface UnnecessaryLayer {
  id: string;
  name: string;
  type: string;
  reason: string;
  depth: number;
  visible: boolean;
  locked: boolean;
  originalVisible: boolean;
  children?: UnnecessaryLayer[];
  parentId?: string;
}

interface SimplifyLayerItemProps {
  layer: UnnecessaryLayer;
  onToggleVisibility: (nodeId: string) => void;
  onDeleteLayer: (nodeId: string) => void;
  onUpdateLayerVisibility: (layerId: string, visible: boolean) => void;
  onAddAnnotation: (nodeId: string, message: string) => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpansion?: (nodeId: string) => void;
  depth?: number;
}

export default function SimplifyLayerItem({
  layer,
  onToggleVisibility,
  onDeleteLayer,
  onUpdateLayerVisibility,
  onAddAnnotation,
  hasChildren = false,
  isExpanded = false,
  onToggleExpansion,
  depth = 0,
}: SimplifyLayerItemProps) {
  // 이유별 아이콘
  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "숨겨진 부모 노드":
        return <LuEyeClosed className="w-4 h-4 text-red-500" />;
      case "숨겨진 자식 노드":
        return <LuEyeClosed className="w-4 h-4 text-orange-500" />;
      default:
        return <LuTriangleAlert className="w-4 h-4 text-gray-500" />;
    }
  };

  // 레이어를 실제 형태로 렌더링
  const renderLayerContent = (type: string, layer: UnnecessaryLayer) => {
    switch (type) {
      case "TEXT":
        // 텍스트 레이어는 실제 텍스트 내용 표시
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
              <span className="text-xs text-blue-600 font-bold">T</span>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "VECTOR":
        // 벡터 레이어는 간단한 벡터 아이콘으로 표현
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-100 border border-indigo-300 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-indigo-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "RECTANGLE":
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "ELLIPSE":
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-100 border border-pink-300 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "INSTANCE":
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
              <LuDiamond className="w-3 h-3 text-orange-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "COMPONENT":
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
              <LuDiamond className="w-3 h-3 text-orange-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "IMAGE":
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded flex items-center justify-center">
              <LuImage className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );

      case "FRAME":
      case "GROUP":
        // 형태가 없는 레이어는 이름만 표시
        return (
          <span className="text-sm text-gray-700 font-medium">
            {layer.name}
          </span>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-600 rounded-sm"></div>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {layer.name}
            </span>
          </div>
        );
    }
  };

  // 이유별 색상
  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "숨겨진 부모 노드":
        return "text-red-600";
      case "숨겨진 자식 노드":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-1">
      {/* 부모 노드 */}
      <div
        className="p-3 border border-gray-200 bg-white rounded-lg"
        style={{ marginLeft: `${depth * 12}px` }}
      >
        <div className="flex items-center gap-3">
          {/* 펼치기/접기 버튼 */}
          <div className="flex-shrink-0">
            {hasChildren && (
              <span
                className="text-xs text-gray-600 w-3 text-center cursor-pointer p-0.5 rounded transition-colors hover:bg-gray-200"
                onClick={() => onToggleExpansion?.(layer.id)}
                title={isExpanded ? "접기" : "펼치기"}
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            )}
          </div>

          {/* 레이어 내용 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {renderLayerContent(layer.type, layer)}
            </div>

            <div className="flex items-center gap-2 mb-1">
              {getReasonIcon(layer.reason)}
              <span
                className={`text-xs font-medium ${getReasonColor(
                  layer.reason
                )}`}
              >
                {layer.reason}
              </span>
            </div>
          </div>

          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onDeleteLayer(layer.id)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="삭제"
            >
              <LuTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 자식 노드들 - 구조 탭과 동일한 스타일 */}
      {hasChildren && isExpanded && (
        <div className="mt-2 border-gray-200">
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 space-y-1 shadow-sm">
            <div className="text-xs text-gray-600 font-medium mb-2 pb-1 border-b border-gray-200">
              자식 요소 ({layer.children?.length || 0}개)
            </div>
            {layer.children?.map((child: UnnecessaryLayer) => (
              <SimplifyLayerItem
                key={child.id}
                layer={child}
                onToggleVisibility={onToggleVisibility}
                onDeleteLayer={onDeleteLayer}
                onUpdateLayerVisibility={onUpdateLayerVisibility}
                onAddAnnotation={onAddAnnotation}
                hasChildren={child.children && child.children.length > 0}
                isExpanded={false} // 자식은 기본적으로 접힌 상태
                onToggleExpansion={onToggleExpansion}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
