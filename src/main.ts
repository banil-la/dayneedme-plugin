// src/main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { GetShareLinkHandler, OS, Product, ResizeWindowHandler } from "./types";
import { plugin } from "./constants";

const TOKEN_KEY = "ACCESS_TOKEN";
const SETTINGS_KEY = "STRING_SETTINGS";

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

export default function () {
  // 윈도우 크기 조정
  on<ResizeWindowHandler>("RESIZE_WINDOW", ({ width, height }) => {
    // console.log("RESIZE_WINDOW:", { width, height });
    figma.ui.resize(width, height);
  });

  // 토큰 저장
  on("SAVE_TOKEN", async (token: string | TokenData) => {
    console.log("SAVE_TOKEN received with token:", token);
    if (
      typeof token === "object" &&
      token !== null &&
      "access_token" in token
    ) {
      // 객체에서 access_token 추출
      token = token.access_token;
    }
    if (!isValidToken(token)) {
      figma.ui.postMessage({
        type: "TOKEN_SAVE_ERROR",
        error: "Invalid token",
      });
      return;
    }
    try {
      await figma.clientStorage.setAsync(TOKEN_KEY, token);
      console.log("Token saved successfully:");
      figma.ui.postMessage({ type: "TOKEN_SAVED", token });
    } catch (error) {
      console.error("Error saving token:", error);
      figma.ui.postMessage({
        type: "TOKEN_SAVE_ERROR",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // 토큰 로드
  on("LOAD_TOKEN", async () => {
    try {
      const token = await figma.clientStorage.getAsync(TOKEN_KEY);
      console.log("Token loaded successfully:");
      figma.ui.postMessage({ type: "LOADED_TOKEN", token });
    } catch (error) {
      console.error("Error loading token:", error);
      figma.ui.postMessage({
        type: "TOKEN_LOAD_ERROR",
        error: JSON.stringify(error),
      });
    }
  });

  // 토큰 삭제
  on("DELETE_TOKEN", async () => {
    try {
      await figma.clientStorage.deleteAsync(TOKEN_KEY);
      console.log("Token deleted successfully");
      figma.ui.postMessage({ type: "TOKEN_DELETED" });
    } catch (error) {
      console.error("Error deleting token:", error);
      figma.ui.postMessage({
        type: "TOKEN_DELETE_ERROR",
        error: JSON.stringify(error),
      });
    }
  });

  // 공유 URL 얻기
  on("GET_SHARE_LINK", () => {
    const selection = figma.currentPage.selection;

    if (!selection.length) {
      emit("SHARE_LINK_ERROR", "Please select a frame first");
      return;
    }

    const node = selection[0];
    const fileKey = figma.fileKey || "KXgRDFTKNPHbLa0IXZTG6x"; // 기본값 추가
    const link = `https://www.figma.com/file/${fileKey}?node-id=${node.id}`;

    console.log("[GET_SHARE_LINK] Creating link with:", {
      fileKey,
      nodeId: node.id,
    });
    emit("SHARE_LINK", link);
  });

  // 디버그: clientStorage 상태 확인
  on("DEBUG_CLIENT_STORAGE", async () => {
    try {
      const storedToken = await figma.clientStorage.getAsync(TOKEN_KEY);
      console.log("DEBUG: Stored token in clientStorage:", storedToken);
    } catch (error) {
      console.error("DEBUG: Error reading clientStorage:", error);
    }
  });

  // 설정 저장
  on("SAVE_STRING_SETTINGS", async (settings: StringSettings) => {
    try {
      await figma.clientStorage.setAsync(SETTINGS_KEY, settings);
      figma.ui.postMessage({
        type: "STRING_SETTINGS_SAVED",
        settings,
      });
    } catch (error) {
      console.error("Error saving string settings:", error);
      figma.ui.postMessage({
        type: "STRING_SETTINGS_SAVE_ERROR",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // 설정 로드
  on("LOAD_STRING_SETTINGS", async () => {
    try {
      const settings = await figma.clientStorage.getAsync(SETTINGS_KEY);
      figma.ui.postMessage({
        type: "STRING_SETTINGS_LOADED",
        settings,
      });
    } catch (error) {
      console.error("Error loading string settings:", error);
      figma.ui.postMessage({
        type: "STRING_SETTINGS_LOAD_ERROR",
        error: JSON.stringify(error),
      });
    }
  });

  // 텍스트 선택 상태 확인
  on("GET_SELECTED_TEXT", () => {
    checkSelection();
  });

  // 선택 변경 감지
  figma.on("selectionchange", () => {
    checkSelection();
  });

  // 선택 상태 체크 및 이벤트 발생
  function checkSelection() {
    try {
      const selection = figma.currentPage.selection;
      const textNode = selection.find((node) => node.type === "TEXT");

      emit("SELECTION_CHANGED", textNode ? textNode.characters : null);
    } catch (error) {
      console.error("[checkSelection] Error:", error);
      emit("SELECTION_CHANGED", null);
    }
  }

  if (figma) {
    console.log(`** FIGMA: ${figma.root.name}`);
  }

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
