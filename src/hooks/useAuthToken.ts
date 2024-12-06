// src/hooks/useAuthToken.ts

import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

export function useAuthToken(): [
  string | null,
  (token: string | null) => void
] {
  const [authToken, setAuthTokenState] = useState<string | null>(null);

  useEffect(() => {
    console.log("useAuthToken: Initializing and emitting LOAD_TOKEN");
    emit("LOAD_TOKEN");

    const handleMessage = (event: MessageEvent) => {
      const { type, token, error } = event.data.pluginMessage;
      console.log(
        "Received pluginMessage in useAuthToken:",
        event.data.pluginMessage
      );

      switch (type) {
        case "LOADED_TOKEN":
          console.log("useAuthToken: LOADED_TOKEN received:", token);
          setAuthTokenState(token);
          break;
        case "TOKEN_SAVED":
          console.log("useAuthToken: TOKEN_SAVED received:", token);
          setAuthTokenState(token);
          break;
        case "TOKEN_DELETED":
          console.log("useAuthToken: TOKEN_DELETED received");
          setAuthTokenState(null);
          break;
        case "TOKEN_SAVE_ERROR":
        case "TOKEN_LOAD_ERROR":
        case "TOKEN_DELETE_ERROR":
          console.error(`useAuthToken: Error - ${type}:`, error);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const setAuthToken = (token: string | null) => {
    console.log("useAuthToken: setAuthToken called with:", token);
    if (token) {
      console.log("useAuthToken: Emitting SAVE_TOKEN event with token:", token);
      emit("SAVE_TOKEN", token);
    } else {
      console.log("useAuthToken: Emitting DELETE_TOKEN event");
      emit("DELETE_TOKEN");
    }
  };

  return [authToken, setAuthToken];
}
