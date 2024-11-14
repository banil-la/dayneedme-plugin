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
      setAuthTokenState(token);
    };

    const handleTokenSaved = () => {
      emit("LOAD_TOKEN");
    };

    const handleTokenDeleted = () => {
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
    setAuthTokenState(token);
    if (token) {
      emit("SAVE_TOKEN", token);
    } else {
      emit("DELETE_TOKEN");
    }
  };

  return [authToken, setAuthToken];
}
