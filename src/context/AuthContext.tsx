// src/context/AuthContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { emit } from "@create-figma-plugin/utilities";
import { useAuthToken } from "../hooks/useAuthToken";
import { getServerUrl } from "../utils/getServerUrl";

interface UserInfo {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface TokenData {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  authToken: string | null;
  refreshToken: string | null;
  setTokens: (tokenData: TokenData | null) => void;
  isLoading: boolean;
  user: UserInfo | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ComponentChildren;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, refreshToken, setTokens, isLoading] = useAuthToken();
  const [user, setUser] = useState<UserInfo | null>(null);
  const serverUrl = getServerUrl();

  useEffect(() => {
    const validateAndFetchUser = async () => {
      if (!authToken) {
        setUser(null);
        return;
      }

      try {
        const response = await fetch(`${serverUrl}/api/auth/get-user-info`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to validate token");
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Token validation failed:", error);
        setTokens(null);
        setUser(null);
      }
    };

    validateAndFetchUser();
  }, [authToken]);

  const fetchUserInfo = async (token: string, refreshToken: string) => {
    try {
      console.log("[fetchUserInfo] Fetching user info with token:", token);
      // const response = await fetch("http://localhost:8080/get-user-info", {
      const response = await fetch(`${serverUrl}/api/auth/get-user-info`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Refresh-Token": refreshToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log(
            "[fetchUserInfo] Access token expired. Attempting refresh..."
          );
          const newTokenData = await refreshAccessToken(refreshToken);
          if (newTokenData) {
            setTokens(newTokenData);
            fetchUserInfo(
              newTokenData.access_token,
              newTokenData.refresh_token
            );
          } else {
            console.error(
              "[fetchUserInfo] Refresh token expired. Logging out."
            );
            setTokens(null);
            setUser(null);
          }
          return;
        }
        throw new Error("[fetchUserInfo] Failed to fetch user information");
      }

      const userData = await response.json();
      console.log("[fetchUserInfo] User data received:", userData);

      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      });
    } catch (error) {
      console.error("[fetchUserInfo] Error fetching user info:", error);
      setUser(null);
    }
  };

  const refreshAccessToken = async (
    refreshToken: string
  ): Promise<TokenData | null> => {
    try {
      const response = await fetch("http://localhost:8080/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      console.log("Access token refreshed:", data.access_token);
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  useEffect(() => {
    if (authToken) {
      console.log("[AuthProvider] Fetching user info...");
      fetchUserInfo(authToken, refreshToken || "");
    } else {
      console.log("[AuthProvider] No authToken, resetting user.");
      setUser(null);
    }
  }, [authToken, refreshToken]);

  useEffect(() => {
    console.log(
      "AuthProvider: authToken changed =",
      authToken ? "exist" : "not exist"
    );
    console.log(
      "AuthProvider: refreshToken changed =",
      refreshToken ? "exist" : "not exist"
    );
  }, [authToken, refreshToken]);

  useEffect(() => {
    const handleLoadedToken = (event: MessageEvent) => {
      console.log("[AuthContext] Received message:", event.data.pluginMessage);

      if (event.data.pluginMessage?.type === "LOADED_TOKEN" && !authToken) {
        // authToken이 없을 때만
        const token = event.data.pluginMessage.token;
        console.log(
          "[AuthContext] Token loaded, emitting TOKEN_LOADED:",
          token
        );
        setTokens(token);
        emit("TOKEN_LOADED", token);
      }
    };

    if (!authToken) {
      // authToken이 없을 때만 LOAD_TOKEN 요청
      console.log("[AuthContext] Setting up token load listener");
      window.addEventListener("message", handleLoadedToken);
      console.log("[AuthContext] Emitting LOAD_TOKEN");
      emit("LOAD_TOKEN");

      return () => {
        console.log("[AuthContext] Cleaning up token load listener");
        window.removeEventListener("message", handleLoadedToken);
      };
    }
  }, [authToken]); // authToken을 의존성 배열에 추가

  return (
    <AuthContext.Provider
      value={{
        authToken,
        refreshToken,
        setTokens,
        isLoading,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
