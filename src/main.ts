// main.ts
import { emit, on, showUI } from "@create-figma-plugin/utilities";

import {
  DeleteTokenHandler,
  GetShareLinkHandler,
  LoadTokenHandler,
  ResizeWindowHandler,
  SaveTokenHandler,
} from "./types";
import { plugin } from "./constants";

export default function () {
  on<ResizeWindowHandler>(
    "RESIZE_WINDOW",
    function (windowSize: { width: number; height: number }) {
      console.log("RESIZE_WINDOW");
      const { width, height } = windowSize;
      figma.ui.resize(width, height);
    }
  );
  on<LoadTokenHandler>("LOAD_TOKEN", async function () {
    console.log("LOAD_TOKEN");
    try {
      const token = await figma.clientStorage.getAsync("authToken");
      emit("LOADED_TOKEN", token);
    } catch (error) {
      console.error("Error loading token:", error);
    }
  });

  on<SaveTokenHandler>("SAVE_TOKEN", async function (token: string) {
    console.log("SAVE_TOKEN received in main.ts");
    try {
      await figma.clientStorage.setAsync("authToken", token);
      console.log("Token saved successfully in main.ts");
      figma.ui.postMessage({ type: "TOKEN_SAVED", token });
    } catch (error) {
      console.error("Error saving token:", error);
      figma.ui.postMessage({ type: "TOKEN_SAVE_ERROR", error: error });
    }
  });

  on<DeleteTokenHandler>("DELETE_TOKEN", async function () {
    console.log("DELETE_TOKEN received");
    try {
      await figma.clientStorage.deleteAsync("authToken");
      console.log("Token deleted successfully");
      figma.ui.postMessage({ type: "TOKEN_DELETED" });
    } catch (error) {
      console.error("Error deleting token:", error);
      figma.ui.postMessage({ type: "TOKEN_DELETE_ERROR", error: error });
    }
  });

  on<GetShareLinkHandler>("GET_SHARE_LINK", async function () {
    console.log("GET_SHARE_LINK");
    try {
      const nodes = figma.currentPage.selection;
      if (nodes.length === 0) {
        emit("NO_FRAME_SELECTED");
        return;
      }
      // 선택된 노드의 ID를 사용하여 공유 링크 생성
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

  showUI({
    height: plugin.size.height,
    width: plugin.size.width,
  });
}
