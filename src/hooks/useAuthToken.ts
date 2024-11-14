// hooks/useAuthToken.ts
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

export function useAuthToken() {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    emit("LOAD_TOKEN");

    const handleLoadedToken = (token: string | null) => {
      setAuthToken(token);
    };

    const handleTokenSaved = () => {
      emit("LOAD_TOKEN");
    };

    const handleTokenDeleted = () => {
      setAuthToken(null);
    };

    on("LOADED_TOKEN", handleLoadedToken);
    on("TOKEN_SAVED", handleTokenSaved);
    on("TOKEN_DELETED", handleTokenDeleted);

    return () => {
      // Clean up listeners
    };
  }, []);

  return [authToken, setAuthToken] as const;
}
