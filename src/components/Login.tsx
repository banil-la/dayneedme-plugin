import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../context/AuthContext";

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
    console.log("Login button clicked");
    try {
      const response = await fetch("http://localhost:8080/supabase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const token = data.access_token;

      if (!token) {
        throw new Error("No token received");
      }

      emit("SAVE_TOKEN", token);
      console.log("Sending SAVE_TOKEN message with token:", token);
    } catch (error) {
      console.error("Login error:", error);
      setError(JSON.stringify(error));
    }
  };

  useEffect(() => {
    const unsubscribe = on("TOKEN_SAVED", (token: string) => {
      console.log("TOKEN_SAVED message received in Login");
      setAuthToken(token);
    });

    return unsubscribe;
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
      {error && <p class="error">{error}</p>}
    </div>
  );
};

export default Login;
