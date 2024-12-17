import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { useAuthToken } from "../hooks/useAuthToken";

interface UserInfo {
  id: string;
  email: string;
  role: string;
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
      const response = await fetch("http://localhost:8080/get-user-info", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Refresh-Token": refreshToken, // Refresh Token을 커스텀 헤더로 추가
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user information");
      }

      const userData = await response.json();
      console.log("Fetched User Info:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user info:", error);
      setUser(null); // 에러 시 유저 정보를 null로 설정
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
