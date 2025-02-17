// src/context/AuthContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { emit } from "@create-figma-plugin/utilities";
import { useAuthToken } from "../hooks/useAuthToken";
import { getServerUrl } from "../utils/getServerUrl";
import { AuthContextType, TokenData, UserInfo } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10분마다 토큰 갱신

interface AuthProviderProps {
  children: ComponentChildren;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, refreshToken, setTokens, isLoading] = useAuthToken();
  const [user, setUser] = useState<UserInfo | null>(null);
  const serverUrl = getServerUrl();

  const refreshAccessToken = async (
    currentRefreshToken: string
  ): Promise<TokenData | null> => {
    try {
      const response = await fetch(`${serverUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: currentRefreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || currentRefreshToken,
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  const fetchUserInfo = async (token: string, currentRefreshToken: string) => {
    try {
      const response = await fetch(`${serverUrl}/api/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 && currentRefreshToken) {
          console.log("Token expired, attempting refresh...");
          const newTokenData = await refreshAccessToken(currentRefreshToken);
          if (newTokenData) {
            setTokens(newTokenData);
            // 새 토큰으로 다시 시도
            return fetchUserInfo(
              newTokenData.access_token,
              newTokenData.refresh_token
            );
          } else {
            console.error("Refresh token expired. Logging out.");
            setTokens(null);
            setUser(null);
          }
          return;
        }
        throw new Error("Failed to fetch user information");
      }

      const userData = await response.json();
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUser(null);
    }
  };

  // 토큰 자동 갱신
  useEffect(() => {
    if (!authToken || !refreshToken) return;

    const refreshTokenPeriodically = async () => {
      const newTokenData = await refreshAccessToken(refreshToken);
      if (newTokenData) {
        setTokens(newTokenData);
      } else {
        setTokens(null);
        setUser(null);
      }
    };

    const refreshInterval = setInterval(
      refreshTokenPeriodically,
      TOKEN_REFRESH_INTERVAL
    );
    return () => clearInterval(refreshInterval);
  }, [authToken, refreshToken]);

  // 토큰이 변경될 때마다 사용자 정보 갱신
  useEffect(() => {
    if (authToken) {
      fetchUserInfo(authToken, refreshToken || "");
    } else {
      setUser(null);
    }
  }, [authToken, refreshToken]);

  // 초기 토큰 로드
  useEffect(() => {
    const handleLoadedToken = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === "LOADED_TOKEN" && !authToken) {
        const token = event.data.pluginMessage.token;
        setTokens(token);
        emit("TOKEN_LOADED", token);
      }
    };

    if (!authToken) {
      window.addEventListener("message", handleLoadedToken);
      emit("LOAD_TOKEN");

      return () => {
        window.removeEventListener("message", handleLoadedToken);
      };
    }
  }, [authToken]);

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

const getUserInfo = async (token: string) => {
  try {
    const response = await fetch(`${getServerUrl()}/api/auth/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // console.error("Error getting user info:", error);
    throw error;
  }
};
