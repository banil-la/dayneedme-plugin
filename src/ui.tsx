// src/ui.tsx

import { h } from "preact";
import "!./output.css";
import { render, useWindowResize } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { ResizeWindowHandler } from "./types";
import { plugin } from "./constants";
import App from "./components/App";
import { AuthProvider } from "./context/AuthContext";
import { GlobalProvider } from "./context/GlobalContext";

function Plugin() {
  function onWindowResize({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) {
    emit<ResizeWindowHandler>("RESIZE_WINDOW", { width, height });
  }

  useWindowResize(onWindowResize, {
    maxHeight: plugin.size.max.height,
    maxWidth: plugin.size.max.width,
    minHeight: plugin.size.min.height,
    minWidth: plugin.size.min.width,
    resizeBehaviorOnDoubleClick: "minimize",
  });

  // SELECTION_CHANGED 이벤트 핸들러 추가
  on("SELECTION_CHANGED", (text: string | null) => {
    // console.log("[UI] Selection changed:", text);
  });

  return (
    <AuthProvider>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </AuthProvider>
  );
}

export default render(Plugin);
