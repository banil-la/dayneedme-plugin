// src/hooks/useAuthToken.ts

import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

export function useAuthToken(): [
  string | null,
  (token: string | null) => void,
  boolean
] {
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        case "TOKEN_SAVED":
          console.log(`useAuthToken: ${type} received:`, token);
          // 여기서 token이 객체인 경우 access_token을 추출
          if (
            typeof token === "object" &&
            token !== null &&
            "access_token" in token
          ) {
            setAuthTokenState(token.access_token);
          } else {
            setAuthTokenState(token);
          }
          setIsLoading(false);
          break;
        case "TOKEN_DELETED":
          console.log("useAuthToken: TOKEN_DELETED received");
          setAuthTokenState(null);
          setIsLoading(false);
          break;
        case "TOKEN_SAVE_ERROR":
        case "TOKEN_LOAD_ERROR":
        case "TOKEN_DELETE_ERROR":
          console.error(`useAuthToken: Error - ${type}:`, error);
          setIsLoading(false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const setAuthToken = (token: string | null) => {
    console.log("useAuthToken: setAuthToken called with:", token);
    setIsLoading(true);
    if (token) {
      console.log("useAuthToken: Emitting SAVE_TOKEN event with token:", token);
      emit("SAVE_TOKEN", token);
    } else {
      console.log("useAuthToken: Emitting DELETE_TOKEN event");
      emit("DELETE_TOKEN");
    }
  };

  return [authToken, setAuthToken, isLoading];
}
