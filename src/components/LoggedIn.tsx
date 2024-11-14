import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import copyToClipboard from "../hooks/copyToClipboard";

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
          handleShareLink(pluginMessage.link);
          break;
        case "NO_FRAME_SELECTED":
          alert("Please select a frame to generate a share link.");
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
      const response = await fetch("http://localhost:3001/create-short-url", {
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
    console.log("Generate Short URL button clicked");
    setIsLoading(true);
    setShortUrl(null);
    console.log("Sending GET_SHARE_LINK message");
    parent.postMessage({ pluginMessage: { type: "GET_SHARE_LINK" } }, "*");
  };

  const handleLogout = () => {
    console.log("Logout button clicked");
    setAuthToken(null); // This will now trigger the DELETE_TOKEN event
  };

  return (
    <div>
      <button onClick={handleGenerateShortUrl} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate Short URL"}
      </button>
      {shortUrl && (
        <p>
          Short URL: <a href={shortUrl}>{shortUrl}</a>
        </p>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LoggedIn;
