// components/LoggedOut.tsx
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

interface LoggedOutProps {
  setAuthToken: (token: string | null) => void;
}

const LoggedOut: React.FC<LoggedOutProps> = ({ setAuthToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("Login button clicked");
    try {
      const response = await fetch("http://localhost:3001/supabase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }

      const data = await response.json();
      const token = data.access_token;

      if (!token) {
        throw new Error("No token received");
      }

      parent.postMessage({ pluginMessage: { type: "SAVE_TOKEN", token } }, "*");
    } catch (error) {
      console.error("Login error:", error);
      alert(`Login failed: ${error}`);
    }
  };

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

  useEffect(() => {
    // 메시지 리스너 추가
    const handleMessage = (event: MessageEvent) => {
      const { type, token } = event.data.pluginMessage;
      if (type === "TOKEN_SAVED") {
        console.log("Token saved successfully");
        setAuthToken(token);
        alert("Login successful!");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setAuthToken]);

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleInputChange}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handleInputChange}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default LoggedOut;
