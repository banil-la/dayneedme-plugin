// src/main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { ResizeWindowHandler, Mode, TokenData } from "./types";
import { plugin } from "./constants";
import {
  sendCurrentFileName,
  handleError,
  isValidToken,
  checkFileKey,
} from "./utils/figmaUtils";
import { checkSelection } from "./handlers/modeHandlers";
import {
  navigateToComponent,
  createComponentInstance,
  fetchComponentsList,
  handleComponentAnalysis,
  handleRenameNode,
  handleChangeText,
  handleToggleVisibility,
  handleToggleLock,
  handleDeleteLayer,
} from "./handlers/componentHandlers";
import {
  handleExportImages,
  handleGetShareLink,
  handleApplyStringCode,
} from "./handlers/otherHandlers";

const TOKEN_KEY = "ACCESS_TOKEN";
const MODE_KEY = "CURRENT_MODE";
let currentMode: Mode = "accessibility"; // 기본 모드

export default function () {
  // 모드 변경 감지
  on("MODE_CHANGED", (newMode: Mode) => {
    console.log("[main] Mode changed:", newMode);
    currentMode = newMode;
    checkSelection(currentMode); // 모드 변경 시 현재 선택 상태 다시 체크
  });

  // 이벤트 핸들러
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

  // ---- 1. Auth Token 이벤트 핸들러 ----
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

  // 0. 피그마
  // 0.1. 피그마 알림 핸들러
  on("SHOW_NOTIFY", function (data: { message: string; error?: boolean }) {
    figma.notify(data.message, { error: data.error });
  });

  // 1. 피그마 파일키
  // 1.1. 파일키 로드 핸들러
  on("TOKEN_LOADED", checkFileKey);
  // 0.3. 피그마 파일명 핸들러
  on("GET_CURRENT_FILENAME", sendCurrentFileName);
  // 0.4. 피그마 파일키 체크 핸들러
  on("CHECK_FILE_KEY", () => {
    figma.clientStorage
      .getAsync(TOKEN_KEY)
      .then((token) => token && checkFileKey(token))
      .catch((error) => handleError("CHECK_FILE_KEY", error));
  });

  // 3. 모드 & 설정
  // 3.1. 모드 저장 핸들러
  on("SAVE_MODE", async (mode: Mode) => {
    try {
      await figma.clientStorage.setAsync(MODE_KEY, mode);
      currentMode = mode;
      emit("MODE_CHANGED", mode);
    } catch (error) {
      handleError("MODE_SAVE", error);
    }
  });
  // 3.2. 모드 로드 핸들러
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
  // 3.3. 설정 저장 핸들러
  on("SAVE_SETTINGS", async function (settings) {
    try {
      await figma.clientStorage.setAsync("appSettings", settings);
    } catch (error) {
      handleError("SETTINGS_SAVE", error);
    }
  });

  // 3.4. 설정 로드 핸들러
  on("LOAD_SETTINGS", async function () {
    try {
      const settings = await figma.clientStorage.getAsync("appSettings");
      if (settings) {
        console.log("[Plugin] Loaded settings:", settings);
        emit("SETTINGS_LOADED", settings);
      }
    } catch (error) {
      handleError("SETTINGS_LOAD", error);
    }
  });

  // 4. 선택된 노드
  // 4.1. 문자열 선택 핸들러
  on("GET_SELECTED_TEXT", () => checkSelection(currentMode));

  // 4.2. 이미지 선택 핸들러
  on("GET_SELECTED_IMAGES", () => {
    // 이미지 모드 선택 처리
    checkSelection(currentMode);
  });

  // 5. 공유 링크 가져오기
  // 5.1. 공유 링크 가져오기 핸들러
  on("GET_SHARE_LINK", handleGetShareLink);

  // 6. 문자열 코드 적용
  // 6.1. 문자열 코드 적용 핸들러
  on("APPLY_STRING_CODE", handleApplyStringCode);

  // 이미지 추출 핸들러
  on("EXPORT_IMAGES", handleExportImages);

  on("GET_COMPONENTS", fetchComponentsList);
  on("SELECT_COMPONENT", navigateToComponent);
  on("ANALYZE_COMPONENT", (componentId: string) => {
    console.log(
      "[main] ANALYZE_COMPONENT event received with ID:",
      componentId
    );
    handleComponentAnalysis(componentId);
  });
  on(
    "RENAME_NODE",
    ({ nodeId, newName }: { nodeId: string; newName: string }) => {
      console.log("[main] RENAME_NODE event received:", { nodeId, newName });
      handleRenameNode(nodeId, newName);
    }
  );
  on(
    "CHANGE_TEXT",
    ({ nodeId, newText }: { nodeId: string; newText: string }) => {
      console.log("[main] CHANGE_TEXT event received:", { nodeId, newText });
      handleChangeText(nodeId, newText);
    }
  );
  on("TOGGLE_VISIBILITY", (nodeId: string) => {
    console.log("[main] TOGGLE_VISIBILITY event received:", nodeId);
    handleToggleVisibility(nodeId);
  });
  on("TOGGLE_LOCK", (nodeId: string) => {
    console.log("[main] TOGGLE_LOCK event received:", nodeId);
    handleToggleLock(nodeId);
  });
  on("DELETE_LAYER", (nodeId: string) => {
    console.log("[main] DELETE_LAYER event received:", nodeId);
    handleDeleteLayer(nodeId);
  });
  on("CLONE_COMPONENT", createComponentInstance);
  on("CHECK_SELECTION", () => checkSelection(currentMode));

  figma.on("selectionchange", () => checkSelection(currentMode));

  // 초기화
  figma.once("run", async () => {
    sendCurrentFileName();
    checkSelection(currentMode);
  });

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
