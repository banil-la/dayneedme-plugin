// components/LoggedOut.tsx
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

interface LoggedOutProps {
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const LoggedOut: React.FC<LoggedOutProps> = ({ setAuthToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(
        // "https://py-prod-adot.vercel.app/supabase-login",
        "http://localhost:3001/supabase-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        alert(`Login failed: ${error.detail}`);
        return;
      }

      const data = await response.json();
      const token = data.access_token;

      if (token) {
        // SAVE_TOKEN 메시지 전송
        parent.postMessage(
          { pluginMessage: { type: "SAVE_TOKEN", token } },
          "*"
        );
      } else {
        alert("Login failed: No token received.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in.");
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
