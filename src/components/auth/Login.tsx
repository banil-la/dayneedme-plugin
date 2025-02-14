// src/components/Login.tsx

import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import classNames from "classnames";
import { getServerUrl } from "../../utils/getServerUrl";
import { TokenData } from "../../types";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [emailError, setEmailError] = useState<string | null>(null); // 이메일 오류 메시지

  const { setTokens } = useAuth();

  // 이메일 검증 함수
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (
    e: h.JSX.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const target = e.currentTarget;

    if (target.type === "email") {
      setEmail(target.value);
      if (!validateEmail(target.value)) {
        setEmailError("Invalid email format.");
      } else {
        setEmailError(null);
      }
    } else if (target.type === "password") {
      setPassword(target.value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${getServerUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();
      if (!data.access_token || !data.refresh_token) {
        throw new Error("Invalid token data received");
      }

      const tokenData: TokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      };

      setTokens(tokenData);
      emit("SAVE_TOKEN", tokenData);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = on("TOKEN_SAVED", (tokenData: TokenData) => {
      setTokens(tokenData);
    });

    return unsubscribe;
  }, [setTokens]);

  // 로그인 버튼 활성화 조건
  const isLoginEnabled = password.length > 0 && email.length > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-base-200">
      <div className="flex flex-col gap-2 items-center justify-center p-4 bg-base-100 shadow-md rounded-md w-80">
        <h2 className="text-lg font-bold mb-2">Login</h2>

        {/* 이메일 입력 */}
        <input
          className={classNames(
            "input input-sm w-full border bg-base-200",
            emailError ? "border-red-500" : "border-gray-300"
          )}
          type="email"
          placeholder="Email"
          value={email}
          onInput={handleInputChange}
        />
        {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

        {/* 비밀번호 입력 */}
        <input
          className="input input-sm w-full border border-gray-300 bg-base-200"
          type="password"
          placeholder="Password"
          value={password}
          onInput={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        {/* 로그인 버튼 */}
        <button
          className={classNames(
            "w-full btn btn-sm mt-2",
            isLoginEnabled ? "btn-primary" : "btn-disabled"
          )}
          onClick={handleLogin}
          disabled={!isLoginEnabled || isLoading}
        >
          {isLoading ? "Loading..." : "Login"}
        </button>

        {/* 오류 메시지 */}
        {error && (
          <p className="text-red-500 text-sm mt-2">
            {error.replace(/\"/g, "")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
