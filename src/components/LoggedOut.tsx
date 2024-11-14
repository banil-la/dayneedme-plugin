// components/LoggedOut.tsx
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

interface LoggedOutProps {
  setAuthToken: (token: string | null) => void;
}

const LoggedOut: React.FC<LoggedOutProps> = ({ setAuthToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    console.log("Login button clicked");
    try {
      const response = await fetch("http://localhost:3001/supabase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response received:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login data:", data);

      const token = data.access_token;

      if (!token) {
        throw new Error("No token received");
      }

      console.log("Sending SAVE_TOKEN message");
      parent.postMessage({ pluginMessage: { type: "SAVE_TOKEN", token } }, "*");

      // setAuthToken은 TOKEN_SAVED 메시지를 받은 후에 호출됩니다.
    } catch (error) {
      console.error("Login error:", error);
      alert(`Login failed: ${error}`);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, token } = event.data.pluginMessage;
      if (type === "TOKEN_SAVED") {
        console.log("TOKEN_SAVED message received");
        setAuthToken(token);
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
