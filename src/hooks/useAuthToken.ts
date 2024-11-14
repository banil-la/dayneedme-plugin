// hooks/useAuthToken.ts
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

export function useAuthToken(): [
  string | null,
  (token: string | null) => void
] {
  const [authToken, setAuthTokenState] = useState<string | null>(null);

  useEffect(() => {
    emit("LOAD_TOKEN");

    const handleLoadedToken = (token: string | null) => {
      console.log("LOADED_TOKEN received:", token);
      setAuthTokenState(token);
    };

    const handleTokenSaved = (token: string) => {
      console.log("TOKEN_SAVED received:", token);
      setAuthTokenState(token);
    };

    const handleTokenDeleted = () => {
      console.log("TOKEN_DELETED received");
      setAuthTokenState(null);
    };

    const loadedTokenUnsubscribe = on("LOADED_TOKEN", handleLoadedToken);
    const tokenSavedUnsubscribe = on("TOKEN_SAVED", handleTokenSaved);
    const tokenDeletedUnsubscribe = on("TOKEN_DELETED", handleTokenDeleted);

    return () => {
      loadedTokenUnsubscribe();
      tokenSavedUnsubscribe();
      tokenDeletedUnsubscribe();
    };
  }, []);

  const setAuthToken = (token: string | null) => {
    console.log("setAuthToken called with:", token);
    setAuthTokenState(token);
    if (token) {
      console.log("Sending SAVE_TOKEN message");
      emit("SAVE_TOKEN", token);
    } else {
      console.log("Sending DELETE_TOKEN message");
      emit("DELETE_TOKEN");
    }
  };

  return [authToken, setAuthToken];
}
