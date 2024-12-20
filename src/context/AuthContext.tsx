import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useAuthToken } from "../hooks/useAuthToken";

interface UserInfo {
  id: string;
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  authToken: string | null;
  refreshToken: string | null;
  setAuthToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  isLoading: boolean;
  user: UserInfo | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ComponentChildren;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken, isLoading] = useAuthToken();
  const [refreshToken, setRefreshToken] = useState<string | null>(null); // 새로 추가
  const [user, setUser] = useState<UserInfo | null>(null);

  // 유저 정보를 가져오는 함수
  const fetchUserInfo = async (token: string, refreshToken: string) => {
    try {
      console.log("[fetchUserInfo] Fetching user info with token:", token);
      const response = await fetch("http://localhost:8080/get-user-info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Refresh-Token": refreshToken,
          "Content-Type": "application/json",
        },
      });

      console.log("[fetchUserInfo] Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Access token expired. Attempting to refresh...");
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            setAuthToken(newToken);
            fetchUserInfo(newToken, refreshToken); // Retry with new token
          } else {
            console.error("Refresh token expired. Logging out.");
            setAuthToken(null);
            setRefreshToken(null);
            setUser(null);
          }
          return;
        }
        throw new Error("Failed to fetch user information");
      }

      const userData = await response.json();
      console.log("[fetchUserInfo] User data received:", userData);
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        name: `${userData.first_name} ${userData.last_name}`,
      }); // 올바른 형식으로 `setUser` 호출
    } catch (error) {
      console.error("[fetchUserInfo] Error fetching user info:", error);
      setUser(null);
    }
  };

  const refreshAccessToken = async (
    refreshToken: string
  ): Promise<string | null> => {
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
      console.log("Access token refreshed:", data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  // authToken 또는 refreshToken 변경 시 유저 정보를 가져옴
  useEffect(() => {
    if (authToken && refreshToken) {
      fetchUserInfo(authToken, refreshToken);
    } else {
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

  return (
    <AuthContext.Provider
      value={{
        authToken,
        refreshToken,
        setAuthToken,
        setRefreshToken,
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
