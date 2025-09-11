// src/handlers/componentHandlers.ts

export function navigateToComponent(componentId: string) {
  try {
    console.log("[main] Attempting to select component:", componentId);
    const component = figma.getNodeById(componentId) as any;

    if (!component) {
      console.error("[main] Component not found:", componentId);
      figma.notify("컴포넌트를 찾을 수 없습니다.", { error: true });
      return;
    }

    console.log("[main] Found component:", {
      id: component.id,
      name: component.name,
      type: component.type,
      parent: component.parent?.type,
    });

    // 컴포넌트가 있는 페이지 찾기
    let targetPage = component.parent;
    while (targetPage && targetPage.type !== "PAGE") {
      targetPage = targetPage.parent;
    }

    if (targetPage && targetPage.type === "PAGE") {
      console.log("[main] Switching to page:", targetPage.name);
      figma.currentPage = targetPage as any;
    }

    // 컴포넌트 선택
    figma.currentPage.selection = [component];

    // 컴포넌트가 보이도록 뷰포트 이동
    console.log("[main] Scrolling to component");
    figma.viewport.scrollAndZoomIntoView([component]);

    // 선택된 컴포넌트를 강조 표시
    figma.notify(`"${component.name}" 컴포넌트로 이동했습니다.`, {
      timeout: 2000,
    });
  } catch (error) {
    console.error("[main] Error selecting component:", error);
    figma.notify("컴포넌트를 찾을 수 없습니다.", { error: true });
  }
}

export function createComponentInstance(componentId: string) {
  try {
    console.log("[main] Attempting to clone component:", componentId);
    const component = figma.getNodeById(componentId) as any;

    if (!component) {
      console.error("[main] Component not found:", componentId);
      figma.notify("컴포넌트를 찾을 수 없습니다.", { error: true });
      return;
    }

    // 현재 선택된 프레임이나 페이지를 찾기
    let targetParent: any = figma.currentPage;
    const selection = figma.currentPage.selection;
    if (selection.length > 0) {
      const selectedNode = selection[0];
      if (selectedNode.type === "FRAME" || selectedNode.type === "GROUP") {
        targetParent = selectedNode;
      }
    }

    // 컴포넌트 인스턴스 생성
    const instance = component.createInstance();

    // 현재 뷰포트의 중앙에 위치시키기
    const center = figma.viewport.center;
    instance.x = center.x - instance.width / 2;
    instance.y = center.y - instance.height / 2;

    // 새로 생성된 인스턴스 선택
    figma.currentPage.selection = [instance];

    figma.notify(`"${component.name}" 컴포넌트가 생성되었습니다.`, {
      timeout: 2000,
    });
  } catch (error) {
    console.error("[main] Error cloning component:", error);
    figma.notify("컴포넌트 생성에 실패했습니다.", { error: true });
  }
}

export async function fetchComponentsList() {
  try {
    console.log("[main] Starting to find components...");
    console.log("[main] Current page:", figma.currentPage.name);

    // 전체 파일의 컴포넌트 검색
    const allComponents = figma.root.findAll(
      (node) => node.type === "COMPONENT"
    ) as any[];

    console.log("[main] Total components found in file:", allComponents.length);

    // 배치 크기 설정
    const BATCH_SIZE = 50;
    let currentIndex = 0;

    // 배치로 데이터 전송
    const sendBatch = async () => {
      const batch = allComponents.slice(
        currentIndex,
        currentIndex + BATCH_SIZE
      );
      if (batch.length > 0) {
        console.log(
          `[main] Processing batch: ${currentIndex} to ${
            currentIndex + batch.length
          }`
        );

        // 각 컴포넌트의 썸네일 생성
        const batchData = await Promise.all(
          batch.map(async (component: any) => {
            try {
              const bytes = await component.exportAsync({
                format: "PNG",
                constraint: { type: "SCALE", value: 1 },
                contentsOnly: true,
              });
              return {
                id: component.id,
                name: component.name,
                description: component.description || "",
                type: component.type,
                thumbnail: bytes,
              };
            } catch (error) {
              console.error(
                `[main] Error exporting thumbnail for ${component.name}:`,
                error
              );
              return {
                id: component.id,
                name: component.name,
                description: component.description || "",
                type: component.type,
                thumbnail: null,
              };
            }
          })
        );

        const message = {
          type: "COMPONENTS_BATCH",
          data: batchData,
          total: allComponents.length,
          current: currentIndex + batch.length,
        };
        console.log("[main] Sending batch message");
        figma.ui.postMessage(message);

        currentIndex += BATCH_SIZE;
        setTimeout(sendBatch, 0);
      } else {
        console.log("[main] All batches sent, sending final loaded message");
        const finalData = await Promise.all(
          allComponents.map(async (component: any) => {
            try {
              const bytes = await component.exportAsync({
                format: "PNG",
                constraint: { type: "SCALE", value: 1 },
                contentsOnly: true,
              });
              return {
                id: component.id,
                name: component.name,
                description: component.description || "",
                type: component.type,
                thumbnail: bytes,
              };
            } catch (error) {
              console.error(
                `[main] Error exporting thumbnail for ${component.name}:`,
                error
              );
              return {
                id: component.id,
                name: component.name,
                description: component.description || "",
                type: component.type,
                thumbnail: null,
              };
            }
          })
        );

        const message = {
          type: "COMPONENTS_LOADED",
          data: finalData,
        };
        console.log("[main] Sending final message");
        figma.ui.postMessage(message);
      }
    };

    sendBatch();
  } catch (error) {
    console.error("[main] Error getting components:", error);
    const errorMessage = {
      type: "COMPONENTS_ERROR",
      error: "컴포넌트를 불러오는데 실패했습니다.",
    };
    console.log("[main] Sending error message:", errorMessage);
    figma.ui.postMessage(errorMessage);
  }
}

// 컴포넌트 구조 분석 함수
// 노드 이름 변경 함수
export function handleRenameNode(nodeId: string, newName: string) {
  try {
    console.log("[RENAME] Starting node rename:", { nodeId, newName });
    const node = figma.getNodeById(nodeId) as any;

    if (!node) {
      console.error("[RENAME] Node not found:", nodeId);
      figma.ui.postMessage({
        type: "RENAME_NODE_ERROR",
        error: "노드를 찾을 수 없습니다.",
      });
      return;
    }

    console.log("[RENAME] Found node:", {
      id: node.id,
      name: node.name,
      type: node.type,
    });

    // 노드 이름 변경
    const oldName = node.name;
    node.name = newName;

    console.log("[RENAME] Node renamed successfully:", {
      id: node.id,
      oldName,
      newName,
    });

    // 성공 메시지 전송
    figma.ui.postMessage({
      type: "RENAME_NODE_SUCCESS",
      data: { nodeId, oldName, newName },
    });

    // Figma 알림
    figma.notify(`"${oldName}" → "${newName}" 이름이 변경되었습니다.`, {
      timeout: 2000,
    });
  } catch (error) {
    console.error("[RENAME] Error renaming node:", error);
    figma.ui.postMessage({
      type: "RENAME_NODE_ERROR",
      error: "노드 이름 변경에 실패했습니다.",
    });
  }
}

// 텍스트 변경 함수
export async function handleChangeText(nodeId: string, newText: string) {
  try {
    console.log("[TEXT] Starting text change:", { nodeId, newText });
    const node = figma.getNodeById(nodeId) as any;

    if (!node) {
      console.error("[TEXT] Node not found:", nodeId);
      figma.ui.postMessage({
        type: "CHANGE_TEXT_ERROR",
        error: "텍스트 노드를 찾을 수 없습니다.",
      });
      return;
    }

    if (node.type !== "TEXT") {
      console.error("[TEXT] Node is not a text node:", node.type);
      figma.ui.postMessage({
        type: "CHANGE_TEXT_ERROR",
        error: "선택한 노드는 텍스트 노드가 아닙니다.",
      });
      return;
    }

    console.log("[TEXT] Found text node:", {
      id: node.id,
      name: node.name,
      currentText: node.characters,
    });

    // 폰트 로드 후 텍스트 변경
    try {
      await figma.loadFontAsync(node.fontName);
      console.log("[TEXT] Font loaded successfully");
    } catch (fontError) {
      console.warn(
        "[TEXT] Font loading failed, trying with default font:",
        fontError
      );
      // 기본 폰트로 시도
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      } catch (defaultFontError) {
        console.error(
          "[TEXT] Default font loading also failed:",
          defaultFontError
        );
      }
    }

    // 텍스트 변경
    node.characters = newText;

    console.log("[TEXT] Text changed successfully:", {
      id: node.id,
      oldText: node.characters,
      newText: newText,
    });

    // UI로 성공 메시지 전송
    figma.ui.postMessage({
      type: "CHANGE_TEXT_SUCCESS",
      data: {
        nodeId: node.id,
        newText: newText,
      },
    });
  } catch (error) {
    console.error("[TEXT] Error changing text:", error);
    figma.ui.postMessage({
      type: "CHANGE_TEXT_ERROR",
      error: "텍스트 변경에 실패했습니다.",
    });
  }
}

// 가시성 토글 함수
export function handleToggleVisibility(nodeId: string) {
  try {
    console.log("[VISIBILITY] Starting visibility toggle:", nodeId);
    const node = figma.getNodeById(nodeId) as any;

    if (!node) {
      console.error("[VISIBILITY] Node not found:", nodeId);
      figma.ui.postMessage({
        type: "TOGGLE_VISIBILITY_ERROR",
        error: "노드를 찾을 수 없습니다.",
      });
      return;
    }

    console.log("[VISIBILITY] Found node:", {
      id: node.id,
      name: node.name,
      type: node.type,
      currentVisible: node.visible,
    });

    // 가시성 토글
    node.visible = !node.visible;

    console.log("[VISIBILITY] Visibility toggled successfully:", {
      id: node.id,
      newVisible: node.visible,
    });

    // UI로 성공 메시지 전송
    figma.ui.postMessage({
      type: "TOGGLE_VISIBILITY_SUCCESS",
      data: {
        nodeId: node.id,
        visible: node.visible,
      },
    });
  } catch (error) {
    console.error("[VISIBILITY] Error toggling visibility:", error);
    figma.ui.postMessage({
      type: "TOGGLE_VISIBILITY_ERROR",
      error: "가시성 변경에 실패했습니다.",
    });
  }
}

export function handleComponentAnalysis(componentId: string) {
  try {
    console.log("[ANALYZE] Starting component analysis for ID:", componentId);
    const component = figma.getNodeById(componentId) as any;

    if (!component) {
      console.error("[ANALYZE] Component not found:", componentId);
      figma.ui.postMessage({
        type: "COMPONENT_ANALYSIS_ERROR",
        error: "컴포넌트를 찾을 수 없습니다.",
      });
      return;
    }

    console.log("[ANALYZE] Found component:", {
      id: component.id,
      name: component.name,
      type: component.type,
      hasChildren: component.children ? component.children.length : 0,
    });

    // 컴포넌트 기본 정보
    const componentInfo = {
      id: component.id,
      name: component.name,
      type: component.type,
      description: component.description || "",
      width: component.width,
      height: component.height,
      x: component.x,
      y: component.y,
      visible: component.visible,
      locked: component.locked,
    };

    console.log("[ANALYZE] Component basic info extracted:", componentInfo);

    // 자식 노드들 분석
    const analyzeNode = (node: any, depth: number = 0): any => {
      console.log(`[ANALYZE] Analyzing node at depth ${depth}:`, {
        name: node.name,
        type: node.type,
        hasChildren: node.children ? node.children.length : 0,
      });

      const nodeInfo: any = {
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.width,
        height: node.height,
        x: node.x,
        y: node.y,
        visible: node.visible,
        locked: node.locked,
        depth: depth,
        children: [],
      };

      // 특정 노드 타입별 추가 정보
      if (node.type === "TEXT") {
        nodeInfo.text = node.characters;
        nodeInfo.fontSize = node.fontSize;
        nodeInfo.fontFamily = node.fontFamily;
        nodeInfo.textAlignHorizontal = node.textAlignHorizontal;
        nodeInfo.textAlignVertical = node.textAlignVertical;
        console.log(`[ANALYZE] TEXT node details:`, {
          text: nodeInfo.text,
          fontSize: nodeInfo.fontSize,
          fontFamily: nodeInfo.fontFamily,
        });
      }

      // Auto Layout 속성 (FRAME, COMPONENT, INSTANCE에 적용 가능)
      if (
        node.type === "FRAME" ||
        node.type === "COMPONENT" ||
        node.type === "INSTANCE"
      ) {
        nodeInfo.layout = {
          layoutMode: node.layoutMode || "NONE",
          itemSpacing: node.itemSpacing || 0,
          paddingTop: node.paddingTop || 0,
          paddingRight: node.paddingRight || 0,
          paddingBottom: node.paddingBottom || 0,
          paddingLeft: node.paddingLeft || 0,
          primaryAxisAlignItems: node.primaryAxisAlignItems || "MIN",
          counterAxisAlignItems: node.counterAxisAlignItems || "MIN",
          layoutWrap: node.layoutWrap || "NO_WRAP",
          layoutSizingHorizontal: node.layoutSizingHorizontal || "FIXED",
          layoutSizingVertical: node.layoutSizingVertical || "FIXED",
        };
        console.log(`[ANALYZE] Auto Layout details:`, {
          layoutMode: nodeInfo.layout.layoutMode,
          itemSpacing: nodeInfo.layout.itemSpacing,
          padding: `${nodeInfo.layout.paddingTop},${nodeInfo.layout.paddingRight},${nodeInfo.layout.paddingBottom},${nodeInfo.layout.paddingLeft}`,
          alignment: `${nodeInfo.layout.primaryAxisAlignItems},${nodeInfo.layout.counterAxisAlignItems}`,
        });
      } else if (
        node.type === "RECTANGLE" ||
        node.type === "ELLIPSE" ||
        node.type === "FRAME"
      ) {
        nodeInfo.fills = node.fills;
        nodeInfo.strokes = node.strokes;
        nodeInfo.strokeWeight = node.strokeWeight;
        nodeInfo.cornerRadius = node.cornerRadius;
        console.log(`[ANALYZE] ${node.type} node details:`, {
          fills: nodeInfo.fills?.length || 0,
          strokes: nodeInfo.strokes?.length || 0,
          strokeWeight: nodeInfo.strokeWeight,
        });
      } else if (node.type === "IMAGE") {
        nodeInfo.imageHash = node.imageHash;
        console.log(`[ANALYZE] IMAGE node details:`, {
          imageHash: nodeInfo.imageHash,
        });
      }

      // 자식 노드들 재귀적으로 분석
      if (node.children && node.children.length > 0) {
        console.log(
          `[ANALYZE] Processing ${node.children.length} children for node:`,
          node.name
        );
        nodeInfo.children = node.children.map((child: any) =>
          analyzeNode(child, depth + 1)
        );
      }

      return nodeInfo;
    };

    console.log("[ANALYZE] Starting recursive node analysis...");
    const structure = analyzeNode(component);
    console.log("[ANALYZE] Node analysis completed");

    const analysis = {
      component: componentInfo,
      structure: structure,
      totalNodes: 0,
      nodeTypes: {} as Record<string, number>,
    };

    // 노드 통계 계산
    const countNodes = (node: any) => {
      analysis.totalNodes++;
      analysis.nodeTypes[node.type] = (analysis.nodeTypes[node.type] || 0) + 1;
      if (node.children) {
        node.children.forEach(countNodes);
      }
    };

    console.log("[ANALYZE] Counting nodes...");
    countNodes(component);
    console.log("[ANALYZE] Node counting completed:", {
      totalNodes: analysis.totalNodes,
      nodeTypes: analysis.nodeTypes,
    });

    console.log("[ANALYZE] Sending analysis result to UI...");
    // UI로 분석 결과 전송
    figma.ui.postMessage({
      type: "COMPONENT_ANALYSIS_RESULT",
      data: analysis,
    });
    console.log("[ANALYZE] Analysis result sent successfully");
  } catch (error) {
    console.error("[ANALYZE] Error analyzing component:", error);
    figma.ui.postMessage({
      type: "COMPONENT_ANALYSIS_ERROR",
      error: "컴포넌트 분석에 실패했습니다.",
    });
  }
}

// 잠금 토글 함수
export function handleToggleLock(nodeId: string) {
  try {
    console.log("[LOCK] Starting lock toggle:", { nodeId });
    const node = figma.getNodeById(nodeId) as any;

    if (!node) {
      console.error("[LOCK] Node not found:", nodeId);
      figma.ui.postMessage({
        type: "TOGGLE_LOCK_ERROR",
        error: "노드를 찾을 수 없습니다.",
      });
      return;
    }

    console.log("[LOCK] Node found:", {
      nodeId,
      name: node.name,
      type: node.type,
      currentLocked: node.locked,
    });

    // 잠금 토글
    const oldLocked = node.locked;
    node.locked = !node.locked;
    console.log("[LOCK] Lock toggled:", {
      nodeId,
      oldLocked,
      newLocked: node.locked,
    });

    // 성공 메시지 전송
    const successMessage = {
      type: "TOGGLE_LOCK_SUCCESS",
      data: {
        nodeId,
        locked: node.locked,
      },
    };
    console.log("[LOCK] Sending success message:", successMessage);
    figma.ui.postMessage(successMessage);
  } catch (error) {
    console.error("[LOCK] Error toggling lock:", error);
    figma.ui.postMessage({
      type: "TOGGLE_LOCK_ERROR",
      error: "잠금 토글에 실패했습니다.",
    });
  }
}

// 레이어 삭제 함수
export function handleDeleteLayer(nodeId: string) {
  try {
    console.log("[DELETE] Starting layer deletion:", { nodeId });
    const node = figma.getNodeById(nodeId) as any;

    if (!node) {
      console.error("[DELETE] Node not found:", nodeId);
      figma.ui.postMessage({
        type: "DELETE_LAYER_ERROR",
        error: "노드를 찾을 수 없습니다.",
      });
      return;
    }

    console.log("[DELETE] Node found:", {
      nodeId,
      name: node.name,
      type: node.type,
      parent: node.parent?.type,
      locked: node.locked,
      parentLocked: node.parent?.locked,
      removable: node.removable,
    });

    // Figma가 제공하는 삭제 가능 여부 확인
    if (node.removable === false) {
      console.error("[DELETE] Node is not removable:", nodeId);
      figma.ui.postMessage({
        type: "DELETE_LAYER_ERROR",
        error: "이 레이어는 삭제할 수 없습니다.",
      });
      return;
    }

    // 삭제 가능 여부 확인
    if (node.locked) {
      console.error("[DELETE] Cannot delete locked node:", nodeId);
      figma.ui.postMessage({
        type: "DELETE_LAYER_ERROR",
        error: "잠긴 레이어는 삭제할 수 없습니다.",
      });
      return;
    }

    // 특정 노드 타입은 삭제할 수 없음
    const nonDeletableTypes = [
      "COMPONENT",
      "COMPONENT_SET",
      "DOCUMENT",
      "PAGE",
      "SLICE",
      "STICKY",
      "CONNECTOR",
      "WIDGET",
    ];

    if (nonDeletableTypes.includes(node.type)) {
      console.error("[DELETE] Cannot delete node type:", node.type);
      figma.ui.postMessage({
        type: "DELETE_LAYER_ERROR",
        error: `${node.type} 타입의 레이어는 삭제할 수 없습니다.`,
      });
      return;
    }

    // 부모가 잠긴 경우도 확인
    if (node.parent && node.parent.locked) {
      console.error("[DELETE] Cannot delete node with locked parent:", nodeId);
      figma.ui.postMessage({
        type: "DELETE_LAYER_ERROR",
        error: "부모 레이어가 잠겨있어 삭제할 수 없습니다.",
      });
      return;
    }

    // 인스턴스인 경우 원본 컴포넌트가 삭제되었는지 확인
    if (node.type === "INSTANCE") {
      const instance = node as InstanceNode;
      if (!instance.mainComponent) {
        console.error("[DELETE] Cannot delete detached instance:", nodeId);
        figma.ui.postMessage({
          type: "DELETE_LAYER_ERROR",
          error: "연결이 끊어진 인스턴스는 삭제할 수 없습니다.",
        });
        return;
      }
    }

    // 노드 삭제
    const nodeName = node.name;
    try {
      node.remove();
      console.log("[DELETE] Node deleted successfully:", {
        nodeId,
        name: nodeName,
      });
    } catch (removeError: any) {
      console.error("[DELETE] Error deleting layer:", removeError);
      figma.ui.postMessage({
        type: "DELETE_LAYER_ERROR",
        error: removeError.message || "레이어 삭제에 실패했습니다.",
      });
      return;
    }

    // 성공 메시지 전송
    figma.ui.postMessage({
      type: "DELETE_LAYER_SUCCESS",
      data: {
        nodeId,
        name: nodeName,
      },
    });

    // 사용자에게 알림
    figma.notify(`"${nodeName}" 레이어가 삭제되었습니다.`, {
      timeout: 2000,
    });
  } catch (error) {
    console.error("[DELETE] Error deleting layer:", error);
    figma.ui.postMessage({
      type: "DELETE_LAYER_ERROR",
      error: "레이어 삭제에 실패했습니다.",
    });
  }
}

// Annotation 추가 함수 (Figma API 사용)
export function handleAddAnnotation(nodeId: string, message: string) {
  try {
    console.log("[ANNOTATION] Starting annotation addition:", {
      nodeId,
      message,
    });
    const node = figma.getNodeById(nodeId) as any;

    if (!node) {
      console.error("[ANNOTATION] Node not found:", nodeId);
      figma.ui.postMessage({
        type: "ADD_ANNOTATION_ERROR",
        error: "노드를 찾을 수 없습니다.",
      });
      return;
    }

    console.log("[ANNOTATION] Node found:", {
      nodeId,
      name: node.name,
      type: node.type,
    });

    // 노드에 annotations 속성이 있는지 확인
    if (!node.annotations) {
      console.error("[ANNOTATION] Node does not support annotations:", nodeId);
      figma.ui.postMessage({
        type: "ADD_ANNOTATION_ERROR",
        error: "이 노드 타입은 annotation을 지원하지 않습니다.",
      });
      return;
    }

    // 기존 annotations 가져오기
    const existingAnnotations = node.annotations || [];

    // 새로운 annotation 추가
    const newAnnotation = {
      label: message,
    };

    // 기존 annotations에 새로운 annotation 추가
    node.annotations = [...existingAnnotations, newAnnotation];

    console.log("[ANNOTATION] Annotation added successfully:", {
      nodeId,
      message,
      totalAnnotations: node.annotations.length,
    });

    // 성공 메시지 전송
    figma.ui.postMessage({
      type: "ADD_ANNOTATION_SUCCESS",
      data: {
        nodeId,
        message,
        totalAnnotations: node.annotations.length,
      },
    });

    // 사용자에게 알림
    figma.notify(`"${node.name}"에 삭제 확인 주석이 추가되었습니다.`, {
      timeout: 3000,
    });
  } catch (error) {
    console.error("[ANNOTATION] Error adding annotation:", error);
    figma.ui.postMessage({
      type: "ADD_ANNOTATION_ERROR",
      error: "주석 추가에 실패했습니다.",
    });
  }
}
