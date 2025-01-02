// src/components/Login.tsx

import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../context/AuthContext";
import classNames from "classnames";
import { TokenData } from "../main";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
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
      const response = await fetch(
        "https://py-prod-adot.vercel.app/api/auth/supabase-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

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

      // 먼저 토큰을 저장하고
      await emit("SAVE_TOKEN", tokenData);
      // 그 다음 상태를 업데이트
      setTokens(tokenData);

      console.log("[Login] Login successful, tokens saved");
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  // TOKEN_SAVED 이벤트 리스너 추가
  useEffect(() => {
    const unsubscribe = on("TOKEN_SAVED", (tokenData: TokenData) => {
      console.log("[Login] TOKEN_SAVED event received:", tokenData);
      setTokens(tokenData);
    });

    return unsubscribe;
  }, [setTokens]);

  // 로그인 버튼 활성화 조건
  const isLoginEnabled = password.length > 0 && email.length > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col gap-2 items-center justify-center p-4 bg-white shadow-md rounded-md w-80">
        <h2 className="text-lg font-bold mb-2">Login</h2>

        {/* 이메일 입력 */}
        <input
          className={classNames(
            "input input-sm w-full border",
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
          className="input input-sm w-full border border-gray-300"
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
