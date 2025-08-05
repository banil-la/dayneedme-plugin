// src/main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { ResizeWindowHandler, SetModeHandler, Mode, TokenData } from "./types";
import { plugin } from "./constants";
import { getServerUrl } from "./utils/getServerUrl";
import { getRgbFromFigmaColor, findEffectiveBackgroundColor } from "./helper";

const serverUrl = getServerUrl();
const TOKEN_KEY = "ACCESS_TOKEN";
const MODE_KEY = "CURRENT_MODE";
let currentMode: Mode = "accessibility"; // 기본 모드

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

/**
 * Figma 선택 변경 시 접근성 관련 정보를 추출하여 UI로 전송하는 메인 함수 (개선됨)
 */
function handleAccessibilityModeSelection() {
  try {
    const selection = figma.currentPage.selection;

    if (selection.length === 1) {
      const node = selection[0];

      let foregroundColor: { r: number; g: number; b: number } | null = null;
      let backgroundColor: { r: number; g: number; b: number } | null = null;

      // 텍스트 노드인 경우 전경색 추출
      if (node.type === "TEXT") {
        if (
          "fills" in node &&
          node.fills !== figma.mixed &&
          node.fills.length > 0
        ) {
          // 텍스트의 첫 번째 유효한 SOLID 채우기를 전경색으로 간주
          const solidFill = node.fills.find(
            (fill) =>
              fill.type === "SOLID" &&
              (fill.opacity === undefined || fill.opacity === 1)
          );
          if (solidFill) {
            foregroundColor = getRgbFromFigmaColor(solidFill.color);
          }
        }
      }

      // 유효한 배경색 탐색 (재귀 헬퍼 함수 사용)
      backgroundColor = findEffectiveBackgroundColor(node);

      // UI로 데이터 전송
      figma.ui.postMessage({
        type: "ACCESSIBILITY_SELECTION_CHANGED",
        data: {
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          foregroundColor,
          backgroundColor,
          hasValidSelection: true,
        },
      });
    } else {
      // 선택된 노드가 없거나 여러 개인 경우
      figma.ui.postMessage({
        type: "ACCESSIBILITY_SELECTION_CHANGED",
        data: {
          hasValidSelection: false,
        },
      });
    }
  } catch (error) {
    console.error("[main] Error in accessibility mode selection:", error);
    figma.ui.postMessage({
      type: "ACCESSIBILITY_SELECTION_CHANGED",
      data: {
        hasValidSelection: false,
      },
    });
  }
}
// --- 접근성 검사 관련 헬퍼 함수 끝 ---

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
  } else if (currentMode === "accessibility") {
    // 접근성 모드 추가
    handleAccessibilityModeSelection();
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

export default function () {
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

  on<SetModeHandler>("SET_MODE", (mode) => {
    currentMode = mode;
    checkSelection();
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
      await figma.clientStorage.setAsync(MODE_KEY, mode);
      currentMode = mode;
      emit("MODE_CHANGED", mode);
    } catch (error) {
      handleError("MODE_SAVE", error);
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

  figma.on("selectionchange", checkSelection);
  // 초기화
  figma.once("run", () => {
    // console.log("[Plugin] Starting with:", {
    //   fileName: getCurrentFileName(),
    //   mode: currentMode,
    // });
    sendCurrentFileName();
    checkSelection();
  });

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
