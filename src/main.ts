// src/main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { ResizeWindowHandler, Mode, TokenData } from "./types";
import { plugin } from "./constants";
import { getServerUrl } from "./utils/getServerUrl";

const serverUrl = getServerUrl();
const TOKEN_KEY = "ACCESS_TOKEN";
const MODE_KEY = "CURRENT_MODE";
const ENV_KEY = "ENV";
let currentMode: Mode = "history"; // 기본 모드
// let currentMode: Mode = "string"; // 임시

// 유틸리티 함수들
const getCurrentFileName = () => figma.root.name;
const sendCurrentFileName = () => {
  const fileName = getCurrentFileName();
  // console.log("[Plugin] Sending current file name:", fileName);
  figma.ui.postMessage({ type: "CURRENT_FILENAME", fileName });
};

const handleError = (context: string, error: unknown) => {
  // console.error(`[${context}] Error:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  figma.ui.postMessage({
    type: `${context.toUpperCase()}_ERROR`,
    error: errorMessage,
  });
  return errorMessage;
};

function isValidToken(token: any): token is string {
  return typeof token === "string" && token.length > 0;
}

function handleStringModeSelection() {
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

function handleUrlModeSelection() {
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

function handleImageModeSelection() {
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

function checkSelection() {
  // console.log("[main] Checking selection in mode:", currentMode);
  if (currentMode === "string") {
    handleStringModeSelection();
  } else if (currentMode === "url") {
    handleUrlModeSelection();
  } else if (currentMode === "image") {
    handleImageModeSelection();
  }
}

async function checkFileKey(authToken: string) {
  const fileName = getCurrentFileName();
  // console.log("[checkFileKey] Starting file key check for:", fileName);

  try {
    const url = `${serverUrl}/api/filekey/search?name=${encodeURIComponent(
      fileName
    )}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[checkFileKey] Response data:", data);

    figma.ui.postMessage({
      type: "FILE_KEY_INFO",
      info: {
        fileName: data.fileName,
        fileKey: data.fileKey,
      },
    });
  } catch (error) {
    handleError("checkFileKey", error);
  }
}

function handleComponentSelection(componentId: string) {
  try {
    console.log("[main] Attempting to select component:", componentId);
    const component = figma.getNodeById(componentId) as SceneNode;

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
      figma.currentPage = targetPage as PageNode;
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

function handleComponentClone(componentId: string) {
  try {
    console.log("[main] Attempting to clone component:", componentId);
    const component = figma.getNodeById(componentId) as ComponentNode;

    if (!component) {
      console.error("[main] Component not found:", componentId);
      figma.notify("컴포넌트를 찾을 수 없습니다.", { error: true });
      return;
    }

    // 현재 선택된 프레임이나 페이지를 찾기
    let targetParent: BaseNode = figma.currentPage;
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

async function handleGetComponents() {
  try {
    console.log("[main] Starting to find components...");
    console.log("[main] Current page:", figma.currentPage.name);

    // 전체 파일의 컴포넌트 검색
    const allComponents = figma.root.findAll(
      (node) => node.type === "COMPONENT"
    ) as ComponentNode[];

    console.log("[main] Total components found in file:", allComponents.length);

    // 배치 크기 설정
    const BATCH_SIZE = 50; // 썸네일 생성으로 인해 배치 크기 감소
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
          batch.map(async (component) => {
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
          allComponents.map(async (component) => {
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

// library test

export default function () {
  // library test

  // 모드 변경 감지
  on("MODE_CHANGED", (newMode: Mode) => {
    console.log("[main] Mode changed:", newMode);
    currentMode = newMode;
    checkSelection(); // 모드 변경 시 현재 선택 상태 다시 체크
  });

  // 이벤트 핸들러 등록
  on<ResizeWindowHandler>("RESIZE_WINDOW", ({ width, height }) => {
    // 최소/최대 크기 제한 적용
    const constrainedWidth = Math.min(
      Math.max(width, plugin.size.min.width),
      plugin.size.max.width
    );
    const constrainedHeight = Math.min(
      Math.max(height, plugin.size.min.height),
      plugin.size.max.height
    );

    figma.ui.resize(constrainedWidth, constrainedHeight);
  });

  on("SAVE_TOKEN", async (token: string | TokenData) => {
    if (
      typeof token === "object" &&
      token !== null &&
      "access_token" in token
    ) {
      token = token.access_token;
    }
    if (!isValidToken(token)) {
      handleError("TOKEN_SAVE", "Invalid token");
      return;
    }
    try {
      await figma.clientStorage.setAsync(TOKEN_KEY, token);
      figma.ui.postMessage({ type: "TOKEN_SAVED", token });
    } catch (error) {
      handleError("TOKEN_SAVE", error);
    }
  });

  on("LOAD_TOKEN", async () => {
    try {
      const token = await figma.clientStorage.getAsync(TOKEN_KEY);
      figma.ui.postMessage({ type: "LOADED_TOKEN", token });
    } catch (error) {
      handleError("TOKEN_LOAD", error);
    }
  });

  on("DELETE_TOKEN", async () => {
    try {
      await figma.clientStorage.deleteAsync(TOKEN_KEY);
      figma.ui.postMessage({ type: "TOKEN_DELETED" });
    } catch (error) {
      handleError("TOKEN_DELETE", error);
    }
  });

  on("GET_SELECTED_TEXT", checkSelection);

  on("GET_SELECTED_IMAGES", () => {
    handleImageModeSelection();
  });

  on("TOKEN_LOADED", checkFileKey);

  on("GET_CURRENT_FILENAME", sendCurrentFileName);

  on("CHECK_FILE_KEY", () => {
    figma.clientStorage
      .getAsync(TOKEN_KEY)
      .then((token) => token && checkFileKey(token))
      .catch((error) => handleError("CHECK_FILE_KEY", error));
  });

  // 문자열 설정 저장 핸들러
  on("SAVE_STRING_SETTINGS", async function (settings) {
    try {
      // console.log("[Plugin] Saving string settings:", settings);
      await figma.clientStorage.setAsync("stringSettings", settings);
    } catch (error) {
      handleError("STRING_SETTINGS_SAVE", error);
    }
  });

  // 문자열 설정 로드 핸들러
  on("LOAD_STRING_SETTINGS", async function () {
    try {
      // console.log("[Plugin] Loading string settings");
      const settings = await figma.clientStorage.getAsync("stringSettings");
      if (settings) {
        console.log("[Plugin] Loaded settings:", settings);
        emit("STRING_SETTINGS_LOADED", settings);
      }
    } catch (error) {
      handleError("STRING_SETTINGS_LOAD", error);
    }
  });

  // 공유 링크 가져오기 핸들러
  on("GET_SHARE_LINK", async function (data: { description: string }) {
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

      // console.log("[Plugin] Node ID generated:", nodeId);

      figma.ui.postMessage({
        type: "SHARE_LINK_RECEIVED",
        link: nodeId,
        description: data.description,
      });
    } catch (error) {
      // console.error("[Plugin] Error getting share link:", error);
      figma.ui.postMessage({
        type: "SHARE_LINK_ERROR",
        error: "공유 링크를 생성하는데 실패했습니다.",
      });
    }
  });

  // 피그마 알림 핸들러
  on("SHOW_NOTIFY", function (data: { message: string; error?: boolean }) {
    figma.notify(data.message, { error: data.error });
  });

  // 문자열 코드 적용 핸들러
  on("APPLY_STRING_CODE", async function (code: string) {
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
      // console.error("[Plugin] Error applying string code:", error);
      figma.notify("레이어 이름 변경에 실패했습니다", { error: true });
    }
  });

  // 이미지 추출 핸들러
  on("EXPORT_IMAGES", async function () {
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
  });

  // 모드 저장 핸들러
  on("SAVE_MODE", async (mode: Mode) => {
    try {
      await figma.clientStorage.setAsync(MODE_KEY, mode); // 스토리지에 저장
      currentMode = mode; // 메모리 업데이트
      checkSelection(); // 선택된 요소 체크
      emit("MODE_CHANGED", mode); // UI에 변경 알림
    } catch (error) {
      handleError("MODE_SAVE", error);
    }
  });
  on("SAVE_ENV", async (env: "dev" | "prod") => {
    try {
      await figma.clientStorage.setAsync(ENV_KEY, env);
    } catch (error) {
      handleError("ENV_SAVE", error);
    }
  });

  // 모드 로드 핸들러
  on("LOAD_MODE", async () => {
    try {
      const savedMode = await figma.clientStorage.getAsync(MODE_KEY);
      if (savedMode) {
        currentMode = savedMode;
        emit("MODE_LOADED", savedMode);
        emit("MODE_CHANGED", savedMode);
      }
    } catch (error) {
      handleError("MODE_LOAD", error);
    }
  });

  on("GET_COMPONENTS", handleGetComponents);
  on("SELECT_COMPONENT", handleComponentSelection);
  on("CLONE_COMPONENT", handleComponentClone);

  figma.on("selectionchange", checkSelection);
  // 초기화
  figma.once("run", async () => {
    // 저장된 모드 불러오기
    try {
      const savedMode = await figma.clientStorage.getAsync(MODE_KEY);
      if (savedMode) {
        currentMode = savedMode;
        emit("MODE_LOADED", savedMode);
      }
    } catch (error) {
      console.error("Error loading saved mode:", error);
    }

    sendCurrentFileName();
    checkSelection();
    // library test
  });

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
