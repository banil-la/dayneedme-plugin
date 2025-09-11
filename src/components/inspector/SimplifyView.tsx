import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  LuTrash2,
  LuEye,
  LuEyeOff,
  LuCircleCheck,
  LuRefreshCw,
} from "react-icons/lu";
import SimplifyLayerItem from "./SimplifyLayerItem";

interface UnnecessaryLayer {
  id: string;
  name: string;
  type: string;
  reason: string;
  depth: number;
  visible: boolean;
  locked: boolean;
  originalVisible: boolean; // 초기 분석 시점의 가시성 상태
  children?: UnnecessaryLayer[]; // 자식 노드들
  parentId?: string; // 부모 노드 ID
}

interface SimplifyViewProps {
  analysis: any;
  onToggleVisibility: (nodeId: string) => void;
  onDeleteLayer: (nodeId: string) => void;
  onLayerCountChange?: (count: number) => void;
  onAddAnnotation: (nodeId: string, message: string) => void;
}

export default function SimplifyView({
  analysis,
  onToggleVisibility,
  onDeleteLayer,
  onLayerCountChange,
  onAddAnnotation,
}: SimplifyViewProps) {
  const [unnecessaryLayers, setUnnecessaryLayers] = useState<
    UnnecessaryLayer[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 불필요한 레이어 감지 함수 (숨겨진 노드만 단순화 대상)
  const detectUnnecessaryLayers = (
    node: any,
    depth: number = 0
  ): UnnecessaryLayer[] => {
    const layers: UnnecessaryLayer[] = [];

    const traverse = (currentNode: any, currentDepth: number) => {
      const isCurrentNodeVisible = currentNode.visible;
      const hasChildren =
        currentNode.children && currentNode.children.length > 0;

      // 디버깅 로그 추가
      console.log(`[SIMPLIFY] 노드 탐색:`, {
        name: currentNode.name,
        type: currentNode.type,
        visible: isCurrentNodeVisible,
        hasChildren: hasChildren,
        depth: currentDepth,
      });

      // 숨겨진 노드는 모두 단순화 대상 (부모-자식 관계와 무관하게)
      if (!isCurrentNodeVisible) {
        const reason = hasChildren ? "숨겨진 부모 노드" : "숨겨진 자식 노드";

        console.log(`[SIMPLIFY] 숨겨진 노드 발견:`, {
          name: currentNode.name,
          type: currentNode.type,
          reason: reason,
          depth: currentDepth,
        });

        layers.push({
          id: currentNode.id,
          name: currentNode.name,
          type: currentNode.type,
          reason: reason,
          depth: currentDepth,
          visible: isCurrentNodeVisible,
          locked: currentNode.locked,
          originalVisible: isCurrentNodeVisible,
        });
      }

      // 자식 노드들 재귀적으로 탐색
      if (currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach((child: any) =>
          traverse(child, currentDepth + 1)
        );
      }
    };

    console.log(`[SIMPLIFY] 분석 시작 - 루트 노드:`, {
      name: node.name,
      type: node.type,
      visible: node.visible,
    });

    traverse(node, depth);

    console.log(`[SIMPLIFY] 분석 완료 - 발견된 숨겨진 노드 수:`, layers.length);
    console.log(
      `[SIMPLIFY] 발견된 노드들:`,
      layers.map((l) => ({ name: l.name, type: l.type, reason: l.reason }))
    );

    // 각 노드의 상세 정보도 출력
    layers.forEach((layer, index) => {
      console.log(`[SIMPLIFY] 노드 ${index + 1}:`, {
        id: layer.id,
        name: layer.name,
        type: layer.type,
        reason: layer.reason,
        depth: layer.depth,
        visible: layer.visible,
      });
    });

    return layers;
  };

  // 불필요한 레이어들을 계층적 구조로 재구성
  const buildHierarchicalStructure = (
    layers: UnnecessaryLayer[],
    rootNode: any
  ): UnnecessaryLayer[] => {
    console.log(
      `[SIMPLIFY] buildHierarchicalStructure 시작 - 입력 레이어 수:`,
      layers.length
    );
    console.log(`[SIMPLIFY] 루트 노드:`, {
      name: rootNode.name,
      type: rootNode.type,
      id: rootNode.id,
    });

    // 트리에서 특정 ID의 노드를 찾는 헬퍼 함수
    const findNodeInTree = (node: any, targetId: string): any => {
      if (node.id === targetId) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = findNodeInTree(child, targetId);
          if (found) return found;
        }
      }
      return null;
    };

    // 처리된 노드들을 마킹하는 헬퍼 함수
    const markProcessedNodes = (
      layer: UnnecessaryLayer,
      processedSet: Set<string>
    ) => {
      processedSet.add(layer.id);
      if (layer.children) {
        layer.children.forEach((child) =>
          markProcessedNodes(child, processedSet)
        );
      }
    };

    const unnecessaryLayerMap = new Map<string, UnnecessaryLayer>();
    const rootLayers: UnnecessaryLayer[] = [];

    // 불필요한 레이어들을 맵에 저장
    layers.forEach((layer) => {
      unnecessaryLayerMap.set(layer.id, { ...layer, children: [] });
    });

    console.log(
      `[SIMPLIFY] 맵에 저장된 레이어 ID들:`,
      Array.from(unnecessaryLayerMap.keys())
    );

    // 단순화 대상 노드만 계층적으로 구성
    const buildHierarchy = (
      node: any,
      parentId?: string
    ): UnnecessaryLayer | null => {
      const isUnnecessary = unnecessaryLayerMap.has(node.id);

      console.log(`[SIMPLIFY] buildHierarchy - 노드 확인:`, {
        name: node.name,
        id: node.id,
        isUnnecessary: isUnnecessary,
        parentId: parentId,
      });

      if (isUnnecessary) {
        const layer = unnecessaryLayerMap.get(node.id)!;
        layer.parentId = parentId;
        layer.children = [];

        console.log(`[SIMPLIFY] 불필요한 노드 발견 - 계층 구조 생성:`, {
          name: layer.name,
          id: layer.id,
          parentId: parentId,
        });

        // 자식 노드들 중에서 단순화 대상인 것들만 처리
        if (node.children) {
          node.children.forEach((child: any) => {
            const childLayer = buildHierarchy(child, node.id);
            if (childLayer) {
              layer.children!.push(childLayer);
              console.log(`[SIMPLIFY] 자식 노드 추가:`, {
                parent: layer.name,
                child: childLayer.name,
              });
            }
          });
        }

        return layer;
      }

      return null;
    };

    // 모든 불필요한 노드들을 부모-자식 관계에 따라 계층 구조로 구성
    const processedNodes = new Set<string>();

    // 1단계: 부모 노드들부터 처리 (자식이 있는 숨겨진 노드들)
    layers.forEach((layer) => {
      if (!processedNodes.has(layer.id)) {
        const nodeInTree = findNodeInTree(rootNode, layer.id);
        if (nodeInTree) {
          const hierarchicalLayer = buildHierarchy(nodeInTree);
          if (hierarchicalLayer) {
            rootLayers.push(hierarchicalLayer);
            console.log(
              `[SIMPLIFY] 부모 노드 계층 구조 추가:`,
              hierarchicalLayer.name
            );

            // 처리된 노드들 마킹
            markProcessedNodes(hierarchicalLayer, processedNodes);
          }
        }
      }
    });

    // 2단계: 아직 처리되지 않은 개별 노드들 추가 (자식이 없는 숨겨진 노드들)
    layers.forEach((layer) => {
      if (!processedNodes.has(layer.id)) {
        rootLayers.push(layer);
        console.log(`[SIMPLIFY] 개별 노드 추가:`, layer.name);
        processedNodes.add(layer.id);
      }
    });

    console.log(
      `[SIMPLIFY] buildHierarchicalStructure 완료 - 결과 레이어 수:`,
      rootLayers.length
    );
    console.log(
      `[SIMPLIFY] 최종 결과:`,
      rootLayers.map((l) => ({
        name: l.name,
        children: l.children?.length || 0,
      }))
    );

    return rootLayers;
  };

  // 수동 분석 시작 (컴포넌트가 변경되었을 때만)
  const startAnalysis = () => {
    if (!analysis || !analysis.structure) return;

    setIsAnalyzing(true);
    setSelectedLayers(new Set());

    // 실제로는 비동기로 처리하지만, 여기서는 즉시 결과 반환
    setTimeout(() => {
      const flatLayers = detectUnnecessaryLayers(analysis.structure);
      const hierarchicalLayers = buildHierarchicalStructure(
        flatLayers,
        analysis.structure
      );
      setUnnecessaryLayers(hierarchicalLayers);
      setIsAnalyzing(false);
      // 부모에게 레이어 개수 전달
      if (onLayerCountChange) {
        onLayerCountChange(flatLayers.length);
      }
    }, 500);
  };

  // 분석 결과가 변경될 때만 불필요한 레이어 감지 (한 번만 실행)
  useEffect(() => {
    if (analysis && analysis.structure) {
      const flatLayers = detectUnnecessaryLayers(analysis.structure);
      const hierarchicalLayers = buildHierarchicalStructure(
        flatLayers,
        analysis.structure
      );
      setUnnecessaryLayers(hierarchicalLayers);
      setSelectedLayers(new Set());
      setExpandedNodes(new Set()); // 확장 상태 초기화
      // 부모에게 레이어 개수 전달
      if (onLayerCountChange) {
        onLayerCountChange(flatLayers.length);
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
    const allLayerIds = new Set<string>();
    const collectAllIds = (layers: UnnecessaryLayer[]) => {
      layers.forEach((layer) => {
        allLayerIds.add(layer.id);
        if (layer.children) {
          collectAllIds(layer.children);
        }
      });
    };
    collectAllIds(unnecessaryLayers);

    if (selectedLayers.size === allLayerIds.size) {
      setSelectedLayers(new Set());
    } else {
      setSelectedLayers(allLayerIds);
    }
  };

  // 노드 펼치기/접기
  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
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

  // 계층적 구조 렌더링
  const renderHierarchicalLayers = (
    layers: UnnecessaryLayer[],
    depth: number = 0
  ): any[] => {
    const result: any[] = [];

    layers.forEach((layer) => {
      const hasChildren = layer.children && layer.children.length > 0;
      const isExpanded = expandedNodes.has(layer.id);

      result.push(
        <SimplifyLayerItem
          key={layer.id}
          layer={layer}
          isSelected={selectedLayers.has(layer.id)}
          onToggleSelection={toggleLayerSelection}
          onToggleVisibility={onToggleVisibility}
          onDeleteLayer={onDeleteLayer}
          onUpdateLayerVisibility={(layerId, visible) => {
            setUnnecessaryLayers((prev) =>
              prev.map((l) => (l.id === layerId ? { ...l, visible } : l))
            );
          }}
          onAddAnnotation={onAddAnnotation}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggleExpansion={toggleNodeExpansion}
          depth={depth}
        />
      );

      // 자식 노드들 렌더링 (확장된 경우에만)
      if (hasChildren && isExpanded) {
        result.push(...renderHierarchicalLayers(layer.children!, depth + 1));
      }
    });

    return result;
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
        <div className="space-y-1">
          {renderHierarchicalLayers(unnecessaryLayers)}
        </div>
      )}
    </div>
  );
}
