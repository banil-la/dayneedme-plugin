// ui.tsx
import { h } from "preact";
import { render, useWindowResize } from "@create-figma-plugin/ui";
import { emit } from "@create-figma-plugin/utilities";

import { ResizeWindowHandler } from "./types";
import { plugin } from "./constants";
import { useAuthToken } from "./hooks/useAuthToken";
import LoggedIn from "./components/LoggedIn";
import LoggedOut from "./components/LoggedOut";

function Plugin() {
  const [authToken, setAuthToken] = useAuthToken();
  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>("RESIZE_WINDOW", windowSize);
    emit("DEBUG_CLIENT_STORAGE");
  }
  useWindowResize(onWindowResize, {
    maxHeight: plugin.size.max.height,
    maxWidth: plugin.size.max.width,
    minHeight: plugin.size.min.height,
    minWidth: plugin.size.min.width,
    resizeBehaviorOnDoubleClick: "minimize",
  });
  return (
    <div className="app-container">
      <p className="uppercase">{authToken ? "authorized" : "not authorized"}</p>
      {authToken ? (
        <LoggedIn authToken={authToken} setAuthToken={setAuthToken} />
      ) : (
        <LoggedOut setAuthToken={setAuthToken} />
      )}
    </div>
  );
}

export default render(Plugin);
