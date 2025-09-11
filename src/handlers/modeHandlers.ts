// src/handlers/modeHandlers.ts

export function handleAccessibilityModeSelection() {}

export function handleStringModeSelection() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 1 && selection[0].type === "TEXT") {
      console.log("[main] Text node selected:", selection[0].characters);
      figma.ui.postMessage({
        type: "STRING_SELECTION_CHANGED",
        data: selection[0].characters,
      });
    } else {
      console.log("[main] No valid text node selected");
      figma.ui.postMessage({
        type: "STRING_SELECTION_CHANGED",
        data: null,
      });
    }
  } catch (error) {
    console.error("[main] Error in string mode selection:", error);
    figma.ui.postMessage({
      type: "STRING_SELECTION_CHANGED",
      data: null,
    });
  }
}

export function handleUrlModeSelection() {
  try {
    const selection = figma.currentPage.selection;
    const validTypes = ["FRAME", "GROUP", "COMPONENT", "INSTANCE", "SECTION"];

    // 선택된 노드 중 유효한 타입이 있는지 확인
    const hasValidSelection = selection.some((node) =>
      validTypes.includes(node.type)
    );

    figma.ui.postMessage({
      type: "URL_SELECTION_CHANGED",
      data: hasValidSelection,
    });
  } catch (error) {
    console.error("[main] Error in URL mode selection:", error);
    figma.ui.postMessage({
      type: "URL_SELECTION_CHANGED",
      data: false,
    });
  }
}

export function handleImageModeSelection() {
  try {
    const selection = figma.currentPage.selection;
    const imageNodes = selection.filter(
      (node) =>
        node.type === "RECTANGLE" ||
        node.type === "ELLIPSE" ||
        node.type === "POLYGON" ||
        node.type === "FRAME" ||
        node.type === "COMPONENT" ||
        node.type === "INSTANCE"
    );

    // 이미지 노드의 상세 정보를 전송
    figma.ui.postMessage({
      type: "IMAGE_SELECTION_CHANGED",
      data: imageNodes.map((node) => ({
        id: node.id,
        name: node.name,
        width: node.width,
        height: node.height,
        type: node.type,
      })),
    });
  } catch (error) {
    console.error("[main] Error in image mode selection:", error);
    figma.ui.postMessage({
      type: "IMAGE_SELECTION_CHANGED",
      data: [],
    });
  }
}

export function handleComponentModeSelection() {
  try {
    const selection = figma.currentPage.selection;
    console.log(
      "[main] Current selection:",
      selection.map((node) => ({ type: node.type, name: node.name }))
    );

    // 자식을 가질 수 있는 노드 타입들
    const validTypes = ["COMPONENT", "INSTANCE", "FRAME", "GROUP", "SECTION"];

    if (selection.length === 1 && validTypes.includes(selection[0].type)) {
      const node = selection[0] as any;
      console.log(
        "[main] Analyzable node selected:",
        node.name,
        "type:",
        node.type
      );

      // 노드가 실제로 자식을 가지고 있는지 확인
      const hasChildren = node.children && node.children.length > 0;

      if (hasChildren) {
        console.log("[main] Node has children, proceeding with analysis");

        // 노드 기본 정보 추출
        const nodeInfo = {
          id: node.id,
          name: node.name,
          type: node.type,
          description: node.description || "",
          width: node.width,
          height: node.height,
          x: node.x,
          y: node.y,
          visible: node.visible,
          locked: node.locked,
        };

        figma.ui.postMessage({
          type: "COMPONENT_SELECTION_CHANGED",
          data: nodeInfo,
        });
      } else {
        console.log("[main] Node has no children, skipping analysis");
        figma.ui.postMessage({
          type: "COMPONENT_SELECTION_CHANGED",
          data: null,
        });
      }
    } else {
      console.log("[main] No valid analyzable node selected");
      figma.ui.postMessage({
        type: "COMPONENT_SELECTION_CHANGED",
        data: null,
      });
    }
  } catch (error) {
    console.error("[main] Error in component mode selection:", error);
    figma.ui.postMessage({
      type: "COMPONENT_SELECTION_CHANGED",
      data: null,
    });
  }
}

export function checkSelection(currentMode: string) {
  if (currentMode === "string") {
    handleStringModeSelection();
  } else if (currentMode === "url") {
    handleUrlModeSelection();
  } else if (currentMode === "image") {
    handleImageModeSelection();
  } else if (currentMode === "accessibility") {
    handleAccessibilityModeSelection();
  } else if (currentMode === "inspector") {
    handleComponentModeSelection();
  }
}
