// src/components/Login.tsx

import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../context/AuthContext";
import classNames from "classnames";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setAuthToken } = useAuth();

  const handleInputChange = (
    e: h.JSX.TargetedEvent<HTMLInputElement, Event>
  ) => {
    const target = e.currentTarget;
    if (target.type === "email") {
      setEmail(target.value);
    } else if (target.type === "password") {
      setPassword(target.value);
    }
  };

  const handleLogin = async () => {
    setError(null);
    try {
      const response = await fetch(
        "https://py-prod-adot.vercel.app/supabase-login",
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
      if (!data.access_token) {
        throw new Error("No token received");
      }

      emit("SAVE_TOKEN", {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
    } catch (error) {
      setError(JSON.stringify(error));
    }
  };

  useEffect(() => {
    const unsubscribe = on(
      "TOKEN_SAVED",
      (tokens: { access_token: string; refresh_token: string }) => {
        setAuthToken(tokens.access_token);
        // 리프레시 토큰도 저장
      }
    );

    return unsubscribe;
  }, [setAuthToken]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-red-100">
      <div className="flex flex-col gap-2 items-center justify-center">
        <input
          className="input input-sm border border-[#FF0000]"
          type="email"
          placeholder="Email"
          value={email}
          onChange={handleInputChange}
        />
        <input
          className="input input-sm border border-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleInputChange}
        />
        <button
          class={classNames(
            "w-full btn btn-sm",
            email.length > 0 && password.length > 0 && "btn-primary"
          )}
          onClick={handleLogin}
        >
          Login
        </button>
        {error && <p class="error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
