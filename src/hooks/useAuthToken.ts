// src/hooks/useAuthToken.ts

import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import { TokenData } from "../types";

export function useAuthToken(): [
  string | null,
  string | null,
  (token: TokenData | null) => void,
  boolean
] {
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
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
          console.log(
            `useAuthToken: ${type} received:`,
            token ? "exist" : "not exist"
          );
          if (
            typeof token === "object" &&
            token !== null &&
            "access_token" in token &&
            "refresh_token" in token
          ) {
            setAuthTokenState(token.access_token);
            setRefreshTokenState(token.refresh_token);
          } else if (typeof token === "string") {
            setAuthTokenState(token);
          }
          setIsLoading(false);
          break;
        case "TOKEN_DELETED":
          console.log("useAuthToken: TOKEN_DELETED received");
          setAuthTokenState(null);
          setRefreshTokenState(null);
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

  const setTokens = (tokenData: TokenData | null) => {
    console.log("useAuthToken: setTokens called with:", tokenData);
    setIsLoading(true);
    if (tokenData) {
      console.log(
        "useAuthToken: Emitting SAVE_TOKEN event with token:",
        tokenData
      );
      emit("SAVE_TOKEN", tokenData);
    } else {
      console.log("useAuthToken: Emitting DELETE_TOKEN event");
      emit("DELETE_TOKEN");
    }
  };

  return [authToken, refreshToken, setTokens, isLoading];
}
