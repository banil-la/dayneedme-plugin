// src/ui.tsx

import { h } from "preact";
import "!./output.css";
import { render, useWindowResize } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";
import { ResizeWindowHandler } from "./types";
import { plugin } from "./utils/constants";
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

  return (
    <AuthProvider>
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </AuthProvider>
  );
}

export default render(Plugin);
