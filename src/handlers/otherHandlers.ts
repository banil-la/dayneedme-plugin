// src/handlers/otherHandlers.ts

export async function handleExportImages() {
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

    if (imageNodes.length === 0) {
      figma.ui.postMessage({
        type: "EXPORT_ERROR",
        error: "추출할 이미지가 없습니다.",
      });
      return;
    }

    // 각 노드에 대해 3배수 크기로 이미지 추출
    for (const node of imageNodes) {
      const bytes = await node.exportAsync({
        format: "PNG",
        constraint: {
          type: "SCALE",
          value: 3,
        },
      });

      // 파일 이름 생성 (노드 이름 + @3x)
      const fileName = `${node.name || "image"}@3x.png`;

      // 다운로드를 위해 UI에 데이터 전송
      figma.ui.postMessage({
        type: "DOWNLOAD_IMAGE",
        fileName: fileName,
        bytes: bytes,
      });
    }

    figma.ui.postMessage({ type: "EXPORT_COMPLETE" });
    figma.notify(`${imageNodes.length}개의 이미지가 추출되었습니다.`);
  } catch (error) {
    console.error("[main] Error exporting images:", error);
    figma.ui.postMessage({
      type: "EXPORT_ERROR",
      error: "이미지 추출 중 오류가 발생했습니다.",
    });
  }
}

export async function handleGetShareLink(data: { description: string }) {
  try {
    const selection = figma.currentPage.selection;
    if (!selection.length) {
      figma.ui.postMessage({
        type: "SHARE_LINK_ERROR",
        error: "선택된 프레임이 없습니다.",
      });
      return;
    }

    const node = selection[0];
    const nodeId = node.id;

    figma.ui.postMessage({
      type: "SHARE_LINK_RECEIVED",
      link: nodeId,
      description: data.description,
    });
  } catch (error) {
    figma.ui.postMessage({
      type: "SHARE_LINK_ERROR",
      error: "공유 링크를 생성하는데 실패했습니다.",
    });
  }
}

export async function handleApplyStringCode(code: string) {
  try {
    const selection = figma.currentPage.selection;
    if (!selection.length) {
      figma.notify("선택된 레이어가 없습니다", { error: true });
      return;
    }

    const node = selection[0];
    if (node.type === "TEXT") {
      node.name = code;
      figma.notify("레이어 이름이 변경되었습니다");
    } else {
      figma.notify("텍스트 레이어가 아닙니다", { error: true });
    }
  } catch (error) {
    figma.notify("레이어 이름 변경에 실패했습니다", { error: true });
  }
}
