// src/hooks/useAuthToken.ts

import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

interface TokenData {
  access_token: string;
  refresh_token: string;
}

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
    console.log("[useAuthToken] Initializing...");
    emit("LOAD_TOKEN");

    const handleMessage = (event: MessageEvent) => {
      const { type, token, error } = event.data.pluginMessage || {};
      console.log(
        "[useAuthToken] Received message:",
        type,
        token ? "exists" : "null"
      );

      switch (type) {
        case "LOADED_TOKEN":
        case "TOKEN_SAVED":
          console.log("[useAuthToken] Processing token:", token);
          if (token) {
            if (typeof token === "object" && "access_token" in token) {
              setAuthTokenState(token.access_token);
              setRefreshTokenState(token.refresh_token);
            } else {
              setAuthTokenState(token);
            }
          }
          setIsLoading(false);
          break;

        case "TOKEN_DELETED":
          setAuthTokenState(null);
          setRefreshTokenState(null);
          setIsLoading(false);
          break;

        case "TOKEN_SAVE_ERROR":
        case "TOKEN_LOAD_ERROR":
        case "TOKEN_DELETE_ERROR":
          console.error(`[useAuthToken] Error - ${type}:`, error);
          setIsLoading(false);
          break;

        default:
          setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeoutId);
    };
  }, []);

  const setTokens = (tokenData: TokenData | null) => {
    console.log("[useAuthToken] Setting tokens:", tokenData);
    setIsLoading(true);
    if (tokenData) {
      setAuthTokenState(tokenData.access_token);
      setRefreshTokenState(tokenData.refresh_token);
      emit("SAVE_TOKEN", tokenData);
    } else {
      setAuthTokenState(null);
      setRefreshTokenState(null);
      emit("DELETE_TOKEN");
    }
  };

  return [authToken, refreshToken, setTokens, isLoading];
}
