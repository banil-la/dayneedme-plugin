import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  LuTrash2,
  LuEye,
  LuEyeOff,
  LuTriangleAlert,
  LuCircleCheck,
  LuRefreshCw,
} from "react-icons/lu";

interface UnnecessaryLayer {
  id: string;
  name: string;
  type: string;
  reason: string;
  depth: number;
  visible: boolean;
  locked: boolean;
  originalVisible: boolean; // 초기 분석 시점의 가시성 상태
}

interface SimplifyViewProps {
  analysis: any;
  onToggleVisibility: (nodeId: string) => void;
  onDeleteLayer: (nodeId: string) => void;
  onLayerCountChange?: (count: number) => void;
}

export default function SimplifyView({
  analysis,
  onToggleVisibility,
  onDeleteLayer,
  onLayerCountChange,
}: SimplifyViewProps) {
  const [unnecessaryLayers, setUnnecessaryLayers] = useState<
    UnnecessaryLayer[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());

  // 불필요한 레이어 감지 함수 (초기 상태 기준으로 고정)
  const detectUnnecessaryLayers = (
    node: any,
    depth: number = 0
  ): UnnecessaryLayer[] => {
    const layers: UnnecessaryLayer[] = [];

    const traverse = (currentNode: any, currentDepth: number) => {
      // 숨겨진 레이어 (visible: false) - 초기 상태 기준
      if (!currentNode.visible) {
        layers.push({
          id: currentNode.id,
          name: currentNode.name,
          type: currentNode.type,
          reason: "숨겨진 레이어",
          depth: currentDepth,
          visible: currentNode.visible,
          locked: currentNode.locked,
          originalVisible: currentNode.visible, // 초기 상태 저장
        });
      }

      // 빈 텍스트 레이어 (TEXT 타입이지만 내용이 비어있거나 공백만 있는 경우)
      if (
        currentNode.type === "TEXT" &&
        (!currentNode.text || currentNode.text.trim() === "")
      ) {
        layers.push({
          id: currentNode.id,
          name: currentNode.name,
          type: currentNode.type,
          reason: "빈 텍스트 레이어",
          depth: currentDepth,
          visible: currentNode.visible,
          locked: currentNode.locked,
          originalVisible: currentNode.visible, // 초기 상태 저장
        });
      }

      // 크기가 0인 레이어 (width 또는 height가 0)
      if (currentNode.width === 0 || currentNode.height === 0) {
        layers.push({
          id: currentNode.id,
          name: currentNode.name,
          type: currentNode.type,
          reason: "크기가 0인 레이어",
          depth: currentDepth,
          visible: currentNode.visible,
          locked: currentNode.locked,
          originalVisible: currentNode.visible, // 초기 상태 저장
        });
      }

      // 자식이 없는 빈 컨테이너 (FRAME, GROUP 등)
      if (
        (currentNode.type === "FRAME" || currentNode.type === "GROUP") &&
        (!currentNode.children || currentNode.children.length === 0)
      ) {
        layers.push({
          id: currentNode.id,
          name: currentNode.name,
          type: currentNode.type,
          reason: "빈 컨테이너",
          depth: currentDepth,
          visible: currentNode.visible,
          locked: currentNode.locked,
          originalVisible: currentNode.visible, // 초기 상태 저장
        });
      }

      // 자식 노드들 재귀적으로 탐색
      if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach((child: any) =>
          traverse(child, currentDepth + 1)
        );
      }
    };

    traverse(node, depth);
    return layers;
  };

  // 수동 분석 시작 (컴포넌트가 변경되었을 때만)
  const startAnalysis = () => {
    if (!analysis || !analysis.structure) return;

    setIsAnalyzing(true);
    setSelectedLayers(new Set());

    // 실제로는 비동기로 처리하지만, 여기서는 즉시 결과 반환
    setTimeout(() => {
      const layers = detectUnnecessaryLayers(analysis.structure);
      setUnnecessaryLayers(layers);
      setIsAnalyzing(false);
      // 부모에게 레이어 개수 전달
      if (onLayerCountChange) {
        onLayerCountChange(layers.length);
      }
    }, 500);
  };

  // 분석 결과가 변경될 때만 불필요한 레이어 감지 (한 번만 실행)
  useEffect(() => {
    if (analysis && analysis.structure) {
      const layers = detectUnnecessaryLayers(analysis.structure);
      setUnnecessaryLayers(layers);
      setSelectedLayers(new Set());
      // 부모에게 레이어 개수 전달
      if (onLayerCountChange) {
        onLayerCountChange(layers.length);
      }
    }
  }, [analysis?.component?.id, onLayerCountChange]); // component.id가 변경될 때만 실행

  // 레이어 개수 변경 시 부모에게 알림 (삭제 시에만)
  useEffect(() => {
    if (onLayerCountChange) {
      onLayerCountChange(unnecessaryLayers.length);
    }
  }, [unnecessaryLayers.length, onLayerCountChange]);

  // 레이어 선택/해제
  const toggleLayerSelection = (layerId: string) => {
    const newSelected = new Set(selectedLayers);
    if (newSelected.has(layerId)) {
      newSelected.delete(layerId);
    } else {
      newSelected.add(layerId);
    }
    setSelectedLayers(newSelected);
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedLayers.size === unnecessaryLayers.length) {
      setSelectedLayers(new Set());
    } else {
      setSelectedLayers(new Set(unnecessaryLayers.map((layer) => layer.id)));
    }
  };

  // 선택된 레이어들 정리
  const cleanupSelectedLayers = () => {
    selectedLayers.forEach((layerId) => {
      onDeleteLayer(layerId);
    });
    setSelectedLayers(new Set());
    // 삭제된 레이어들을 목록에서 제거
    setUnnecessaryLayers((prev) =>
      prev.filter((layer) => !selectedLayers.has(layer.id))
    );
  };

  // 선택된 레이어들 일괄 숨김 해제
  const showSelectedLayers = () => {
    selectedLayers.forEach((layerId) => {
      onToggleVisibility(layerId);
      // 로컬 상태에서 가시성만 업데이트 (레이어 목록은 유지)
      setUnnecessaryLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, visible: true } : layer
        )
      );
    });
    setSelectedLayers(new Set());
  };

  // 선택된 레이어들 일괄 숨김
  const hideSelectedLayers = () => {
    selectedLayers.forEach((layerId) => {
      onToggleVisibility(layerId);
      // 로컬 상태에서 가시성만 업데이트 (레이어 목록은 유지)
      setUnnecessaryLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, visible: false } : layer
        )
      );
    });
    setSelectedLayers(new Set());
  };

  // 이유별 아이콘
  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case "숨겨진 레이어":
        return <LuEyeOff className="w-4 h-4 text-gray-500" />;
      case "빈 텍스트 레이어":
        return <LuTriangleAlert className="w-4 h-4 text-yellow-500" />;
      case "크기가 0인 레이어":
        return <LuTriangleAlert className="w-4 h-4 text-red-500" />;
      case "빈 컨테이너":
        return <LuTriangleAlert className="w-4 h-4 text-orange-500" />;
      default:
        return <LuTriangleAlert className="w-4 h-4 text-gray-500" />;
    }
  };

  // 이유별 색상
  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "숨겨진 레이어":
        return "text-gray-600";
      case "빈 텍스트 레이어":
        return "text-yellow-600";
      case "크기가 0인 레이어":
        return "text-red-600";
      case "빈 컨테이너":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            불필요한 레이어 정리
          </h3>
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuRefreshCw
              className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            {isAnalyzing ? "분석 중..." : "다시 분석"}
          </button>
        </div>

        {unnecessaryLayers.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={selectedLayers.size === unnecessaryLayers.length}
                onChange={toggleAllSelection}
                className="rounded"
              />
              전체 선택 ({selectedLayers.size}/{unnecessaryLayers.length})
            </label>
            {selectedLayers.size > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={showSelectedLayers}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <LuEye className="w-3 h-3" />
                  숨김 해제 ({selectedLayers.size}개)
                </button>
                <button
                  onClick={hideSelectedLayers}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  <LuEyeOff className="w-3 h-3" />
                  숨김 ({selectedLayers.size}개)
                </button>
                <button
                  onClick={cleanupSelectedLayers}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <LuTrash2 className="w-3 h-3" />
                  삭제 ({selectedLayers.size}개)
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <LuRefreshCw className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm">
            불필요한 레이어를 분석하고 있습니다...
          </span>
        </div>
      ) : unnecessaryLayers.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <LuCircleCheck className="w-5 h-5 mr-2" />
          <span className="text-sm">정리할 불필요한 레이어가 없습니다!</span>
        </div>
      ) : (
        <div className="space-y-2">
          {unnecessaryLayers.map((layer) => (
            <div
              key={layer.id}
              className={`p-3 border rounded-lg ${
                selectedLayers.has(layer.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedLayers.has(layer.id)}
                  onChange={() => toggleLayerSelection(layer.id)}
                  className="rounded"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getReasonIcon(layer.reason)}
                    <span className="text-sm font-medium text-gray-900">
                      {layer.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({layer.type})
                    </span>
                    <span
                      className={`text-xs font-medium ${getReasonColor(
                        layer.reason
                      )}`}
                    >
                      {layer.reason}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    깊이: {layer.depth} •{layer.visible ? " 보임" : " 숨김"} •
                    {layer.locked ? " 잠김" : " 잠금 해제"}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      onToggleVisibility(layer.id);
                      // 로컬 상태에서 가시성만 업데이트 (레이어 목록은 유지)
                      setUnnecessaryLayers((prev) =>
                        prev.map((l) =>
                          l.id === layer.id ? { ...l, visible: !l.visible } : l
                        )
                      );
                    }}
                    className={`p-1 rounded transition-colors ${
                      layer.visible
                        ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                    title={layer.visible ? "숨기기" : "보이기"}
                  >
                    {layer.visible ? (
                      <LuEye className="w-4 h-4" />
                    ) : (
                      <LuEyeOff className="w-4 h-4" />
                    )}
                  </button>
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
          ))}
        </div>
      )}
    </div>
  );
}
