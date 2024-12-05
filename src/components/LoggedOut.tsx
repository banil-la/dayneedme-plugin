// components/LoggedOut.tsx

import { emit } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

interface LoggedOutProps {
  setAuthToken: (token: string | null) => void;
}

const LoggedOut: React.FC<LoggedOutProps> = ({ setAuthToken }) => {
  const [email, setEmail] = useState("junseok.kim.sk@gmail.com");
  const [password, setPassword] = useState("Qkdltm0143!!");

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
      const response = await fetch("http://localhost:8080/supabase-login", {
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
      console.log("Login response data:", data);

      console.log("Server response:", data);
      const token = data.access_token;
      console.log("Extracted token:", token);

      if (!token) {
        throw new Error("No token received");
      }

      // console.log("Sending SAVE_TOKEN message");
      // parent.postMessage({ pluginMessage: { type: "SAVE_TOKEN", token } }, "*");

      // emit 함수를 사용하여 일관성 있게 메시지 전달
      emit("SAVE_TOKEN", token);
      console.log("Sending SAVE_TOKEN message with token:", token);

      // setAuthToken은 TOKEN_SAVED 메시지를 받은 후에 호출됩니다.
    } catch (error) {
      console.error("Login error:", error);
      alert(`Login failed: ${error}`);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, token } = event.data.pluginMessage;
      console.log(
        "Received pluginMessage in LoggedOut:",
        event.data.pluginMessage
      );

      if (type === "TOKEN_SAVED") {
        console.log("TOKEN_SAVED message received in LoggedOut");
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
