// src/main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { GetShareLinkHandler, OS, Product, ResizeWindowHandler } from "./types";
import { plugin } from "./utils/constants";
import { getServerUrl } from "./utils/getServerUrl";

const serverUrl = getServerUrl();

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
  on<GetShareLinkHandler>("GET_SHARE_LINK", async ({ authToken, fileKey }) => {
    try {
      const nodeId = figma.currentPage.selection[0].id;
      const url = `https://www.figma.com/file/${fileKey}?node-id=${nodeId}`;

      const response = await fetch(`${serverUrl}/api/url/create-short-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to create short URL");
      }

      const { shortUrl } = await response.json();
      console.log("[GET_SHARE_LINK] Short URL created successfully:", shortUrl);
      emit("SHARE_LINK", shortUrl);
    } catch (error) {
      console.error("[GET_SHARE_LINK] Error:", error);
      emit(
        "SHARE_LINK_ERROR",
        error instanceof Error ? error.message : String(error)
      );
    }
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

  // 노드 이동
  on("NAVIGATE_TO_NODE", ({ fileKey, nodeId }) => {
    if (fileKey !== figma.fileKey) {
      figma.notify("This node is in a different file.");
      return;
    }

    const node = figma.getNodeById(nodeId) as SceneNode;
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    } else {
      figma.notify("Node not found in current file.");
    }
  });

  // 파일키 정보 확인
  const checkFileKey = async (authToken: string) => {
    const fileName = figma.root.name;
    console.log("[checkFileKey] Starting file key check for:", fileName);

    try {
      const url = `${serverUrl}/api/url/get-file-key?filename=${encodeURIComponent(
        fileName
      )}`;
      console.log("[checkFileKey] Requesting URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[checkFileKey] Response data:", data);

      figma.ui.postMessage({
        type: "FILE_KEY_INFO",
        info: {
          fileName,
          fileKey: data.fileKey,
          isFromDatabase: data.isFromDatabase,
        },
      });
    } catch (error) {
      console.error("[checkFileKey] Error:", error);
    }
  };

  // 토큰이 로드되면 파일키 확인
  on("TOKEN_LOADED", (token: string) => {
    checkFileKey(token);
  });

  if (figma) {
    console.log(`** FIGMA: ${figma.root.name}`);
  }

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
