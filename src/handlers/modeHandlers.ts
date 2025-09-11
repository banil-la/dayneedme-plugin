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

    if (
      selection.length === 1 &&
      (selection[0].type === "COMPONENT" || selection[0].type === "INSTANCE")
    ) {
      const component = selection[0] as any;
      console.log("[main] Component/Instance selected:", component.name);

      // 컴포넌트 기본 정보 추출
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

      figma.ui.postMessage({
        type: "COMPONENT_SELECTION_CHANGED",
        data: componentInfo,
      });
    } else {
      console.log("[main] No valid component selected");
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
