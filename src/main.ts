// main.ts

import { emit, on, showUI } from "@create-figma-plugin/utilities";
import { GetShareLinkHandler, ResizeWindowHandler } from "./types";
import { plugin } from "./constants";

const TOKEN_KEY = "ACCESS_TOKEN";

export default function () {
  // 윈도우 크기 조정
  on<ResizeWindowHandler>("RESIZE_WINDOW", ({ width, height }) => {
    console.log("RESIZE_WINDOW:", { width, height });
    figma.ui.resize(width, height);
  });

  // 토큰 저장
  on("SAVE_TOKEN", async (token: string) => {
    console.log("SAVE_TOKEN received with token:", token);
    try {
      await figma.clientStorage.setAsync(TOKEN_KEY, token);
      console.log("Token saved successfully:", token);
      figma.ui.postMessage({ type: "TOKEN_SAVED", token });
    } catch (error) {
      console.error("Error saving token:", error);
      figma.ui.postMessage({
        type: "TOKEN_SAVE_ERROR",
        error: JSON.stringify(error),
      });
    }
  });

  // 토큰 로드
  on("LOAD_TOKEN", async () => {
    try {
      const token = await figma.clientStorage.getAsync(TOKEN_KEY);
      console.log("Token loaded successfully:", token);
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

  on<GetShareLinkHandler>("GET_SHARE_LINK", async function () {
    try {
      const nodes = figma.currentPage.selection;
      if (nodes.length === 0) {
        emit("NO_FRAME_SELECTED");
        return;
      }
      const nodeId = nodes[0].id;
      const link = `https://www.figma.com/file/${
        figma.fileKey
      }?node-id=${encodeURIComponent(nodeId)}`;
      emit("SHARE_LINK", link);
    } catch (error) {
      console.error("Error getting share link:", error);
      emit("SHARE_LINK_ERROR", error);
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

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
