// src/main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import {
  OS,
  Product,
  ResizeWindowHandler,
  SetModeHandler,
  Mode,
} from "./types";
import { plugin } from "./constants";
import { getServerUrl } from "./utils/getServerUrl";

const serverUrl = getServerUrl();
const TOKEN_KEY = "ACCESS_TOKEN";

// 유틸리티 함수들
const getCurrentFileName = () => figma.root.name;
const sendCurrentFileName = () => {
  const fileName = getCurrentFileName();
  console.log("[Plugin] Sending current file name:", fileName);
  figma.ui.postMessage({ type: "CURRENT_FILENAME", fileName });
};

const handleError = (context: string, error: unknown) => {
  console.error(`[${context}] Error:`, error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  figma.ui.postMessage({
    type: `${context.toUpperCase()}_ERROR`,
    error: errorMessage,
  });
  return errorMessage;
};

export interface TokenData {
  access_token: string;
  refresh_token: string;
}

function isValidToken(token: any): token is string {
  return typeof token === "string" && token.length > 0;
}

interface StringSettings {
  os: OS;
  product: Product;
}

// let currentMode: Mode = "default"; // 기본 모드
let currentMode: Mode = "string"; // 임시

export default function () {
  // 선택 상태 체크 및 이벤트 발생
  function checkSelection() {
    try {
      const selection = figma.currentPage.selection;
      console.log("[main] Checking selection:", {
        mode: currentMode,
        selectionLength: selection.length,
        selectionTypes: selection.map((node) => node.type),
      });

      if (currentMode === "string") {
        // string 모드: 텍스트 노드가 선택된 경우에만 이벤트 발생
        if (selection.length === 1 && selection[0].type === "TEXT") {
          console.log(
            "[main] Emitting text selection:",
            selection[0].characters
          );
          emit("SELECTION_CHANGED", selection[0].characters);
        } else {
          console.log("[main] Emitting null selection in string mode");
          emit("SELECTION_CHANGED", null);
        }
      } else if (currentMode === "url") {
        // url 모드: 프레임/레이어 선택 여부
        console.log(
          "[main] Emitting URL mode selection state:",
          selection.length > 0
        );
        emit("SELECTION_CHANGED", selection.length > 0);
      }
    } catch (error) {
      console.error("[main] Error in checkSelection:", error);
      emit("SELECTION_CHANGED", null);
    }
  }

  // 파일명으로 파일키-파일명 확인
  const checkFileKey = async (authToken: string) => {
    const fileName = getCurrentFileName();
    console.log("[checkFileKey] Starting file key check for:", fileName);

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
  };

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
  figma.on("selectionchange", checkSelection);
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

  // 문자열 설정 저장 핸들러 추가
  on("SAVE_STRING_SETTINGS", async function (settings) {
    await figma.clientStorage.setAsync("stringSettings", settings);
    emit("STRING_SETTINGS_SAVED", settings);
  });

  // 문자열 설정 로드 핸들러 추가
  on("LOAD_STRING_SETTINGS", async function () {
    try {
      const settings = await figma.clientStorage.getAsync("stringSettings");
      emit("STRING_SETTINGS_LOADED", settings);
    } catch (error) {
      handleError("STRING_SETTINGS_LOAD", error);
    }
  });

  // 공유 링크 가져오기 핸들러 추가
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

      console.log("[Plugin] Node ID generated:", nodeId);

      figma.ui.postMessage({
        type: "SHARE_LINK_RECEIVED",
        link: nodeId,
        description: data.description,
      });
    } catch (error) {
      console.error("[Plugin] Error getting share link:", error);
      figma.ui.postMessage({
        type: "SHARE_LINK_ERROR",
        error: "공유 링크를 생성하는데 실패했습니다.",
      });
    }
  });

  on("SHOW_NOTIFY", function (data: { message: string; error?: boolean }) {
    figma.notify(data.message, { error: data.error });
  });

  // 초기화
  figma.once("run", () => {
    console.log("[Plugin] Starting with:", {
      fileName: getCurrentFileName(),
      mode: currentMode,
    });
    sendCurrentFileName();
    checkSelection();
  });

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
