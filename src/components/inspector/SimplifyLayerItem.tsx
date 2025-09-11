import { h } from "preact";
import {
  LuTrash2,
  LuCheck,
  LuSquare,
  LuEyeClosed,
  LuTriangleAlert,
  LuType,
  LuSquare as LuRectangle,
  LuCircle,
  LuImage,
  LuLayers,
  LuFrame,
  LuDiamond,
  LuStar,
  LuMinus,
  LuTriangle,
  LuArrowRight,
  LuArrowDown,
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
  isSelected: boolean;
  onToggleSelection: (layerId: string) => void;
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
  isSelected,
  onToggleSelection,
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

  // 레이어 타입별 아이콘
  const getLayerTypeIcon = (type: string) => {
    switch (type) {
      case "TEXT":
        return <LuType className="w-4 h-4 text-blue-500" />;
      case "FRAME":
        return <LuFrame className="w-4 h-4 text-green-500" />;
      case "GROUP":
        return <LuLayers className="w-4 h-4 text-purple-500" />;
      case "RECTANGLE":
        return <LuRectangle className="w-4 h-4 text-gray-500" />;
      case "ELLIPSE":
        return <LuCircle className="w-4 h-4 text-pink-500" />;
      case "VECTOR":
        return <LuTriangle className="w-4 h-4 text-indigo-500" />;
      case "STAR":
        return <LuStar className="w-4 h-4 text-yellow-500" />;
      case "LINE":
        return <LuMinus className="w-4 h-4 text-cyan-500" />;
      case "INSTANCE":
        return <LuDiamond className="w-4 h-4 text-orange-500" />;
      case "COMPONENT":
        return <LuDiamond className="w-4 h-4 text-orange-500" />;
      case "IMAGE":
        return <LuImage className="w-4 h-4 text-emerald-500" />;
      default:
        return <LuSquare className="w-4 h-4 text-gray-400" />;
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

  const handleToggleSelection = () => {
    const newSelected = !isSelected;
    onToggleSelection(layer.id);

    // 체크된 경우에만 추가 작업 수행
    if (newSelected) {
      // 숨겨진 레이어라면 숨김 해제
      if (!layer.visible) {
        onToggleVisibility(layer.id);
        onUpdateLayerVisibility(layer.id, true);
      }

      // 삭제 여부 확인 annotation 추가
      onAddAnnotation(layer.id, "삭제 여부 확인 필요");
    }
  };

  return (
    <div className="space-y-1">
      {/* 부모 노드 */}
      <div
        className={`p-3 border rounded-lg ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
        }`}
        style={{ marginLeft: `${depth * 12}px` }}
      >
        <div className="flex items-center gap-3">
          {/* 펼치기/접기 버튼 */}
          <div className="flex-shrink-0">
            {hasChildren ? (
              <span
                className="text-xs text-gray-600 w-3 text-center cursor-pointer p-0.5 rounded transition-colors hover:bg-gray-200"
                onClick={() => onToggleExpansion?.(layer.id)}
                title={isExpanded ? "접기" : "펼치기"}
              >
                {isExpanded ? "▼" : "▶"}
              </span>
            ) : (
              <div className="w-3" />
            )}
          </div>

          {/* 체크 버튼 */}
          <button
            onClick={handleToggleSelection}
            className={`p-1 rounded transition-colors ${
              isSelected
                ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
            title={isSelected ? "선택 해제" : "선택"}
          >
            {isSelected ? (
              <LuCheck className="w-4 h-4" />
            ) : (
              <LuSquare className="w-4 h-4" />
            )}
          </button>

          {/* 레이어 타입 아이콘 */}
          <div className="flex-shrink-0">{getLayerTypeIcon(layer.type)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 truncate">
                {layer.name}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                ({layer.type})
              </span>
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
                isSelected={false} // 자식은 별도 선택 상태 관리
                onToggleSelection={onToggleSelection}
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
