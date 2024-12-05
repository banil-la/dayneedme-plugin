// components/LoggedIn.tsx

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import copyToClipboard from "../hooks/copyToClipboard";
import { emit, on } from "@create-figma-plugin/utilities";

interface LoggedInProps {
  authToken: string;
  setAuthToken: (token: string | null) => void;
}

const LoggedIn: React.FC<LoggedInProps> = ({ authToken, setAuthToken }) => {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Setting up message listener");

    const handleMessage = (event: MessageEvent) => {
      const { pluginMessage } = event.data;
      console.log("Received message in LoggedIn:", pluginMessage);

      switch (pluginMessage.type) {
        case "SHARE_LINK":
          console.log("Received SHARE_LINK:", pluginMessage.link);
          handleShareLink(pluginMessage.link);
          break;
        case "NO_FRAME_SELECTED":
          alert("Please select a frame to generate a share link.");
          setIsLoading(false);
          break;
        case "SHARE_LINK_ERROR":
          console.error("Error from SHARE_LINK:", pluginMessage.error);
          setIsLoading(false);
          break;
        case "TOKEN_DELETED":
          console.log("Token deleted successfully, logging out");
          setAuthToken(null);
          break;
        default:
          console.log("Unhandled message type:", pluginMessage.type);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setAuthToken]);

  const handleShareLink = async (figmaUrl: string) => {
    console.log("Figma URL:", figmaUrl);
    try {
      const response = await fetch("http://localhost:8080/create-short-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ url: figmaUrl }),
      });

      console.log("API Response:", response);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
      }

      const data = await response.json();
      setShortUrl(data.short_url);
      copyToClipboard(data.short_url);
      alert(`Short URL created and copied: ${data.short_url}`);
    } catch (error) {
      console.error("Error creating short URL:", error);
      alert("Failed to create short URL: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShortUrl = () => {
    setIsLoading(true);
    setShortUrl(null);
    emit("GET_SHARE_LINK");
  };
  useEffect(() => {
    function handleShareLink(link: string) {
      // handleShareLink 함수 내용
    }

    on("SHARE_LINK", handleShareLink);
    on("NO_FRAME_SELECTED", () => {
      alert("Please select a frame to generate a share link.");
      setIsLoading(false);
    });
    // 다른 이벤트 리스너들도 유사하게 변경

    return () => {
      // 이벤트 리스너 제거
    };
  }, []);

  useEffect(() => {
    console.log("LoggedIn: Component mounted with authToken:", authToken);
  }, [authToken]);

  const handleLogout = () => {
    console.log("Logout button clicked");
    setAuthToken(null); // This will now trigger the DELETE_TOKEN event
  };

  return (
    <div class={"text-base"}>
      <p>Logged in with token: {authToken}</p>
      <button onClick={handleLogout}>Logout</button>

      <button onClick={handleGenerateShortUrl} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Short URL"}
      </button>
      {shortUrl && (
        <p>
          Short URL: <a href={shortUrl}>{shortUrl}</a>
        </p>
      )}
    </div>
  );
};

export default LoggedIn;
