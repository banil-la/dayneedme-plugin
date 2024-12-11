// src/components/context/AuthContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect } from "preact/hooks";
import { useAuthToken } from "../hooks/useAuthToken";

interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ComponentChildren;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authToken, setAuthToken, isLoading] = useAuthToken();

  useEffect(() => {
    console.log(
      "AuthProvider: authToken changed =",
      authToken ? "exist" : "not exist"
    );
  }, [authToken]);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, isLoading }}>
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
