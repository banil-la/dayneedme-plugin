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
    console.log("Setting up message listener"); // 추가

    const handleMessage = async (event: MessageEvent) => {
      const { pluginMessage } = event.data;
      console.log("Received message:", pluginMessage); // 디버깅용 로그

      if (pluginMessage.type === "SHARE_LINK") {
        const figmaUrl = pluginMessage.link;
        console.log("Figma URL:", figmaUrl); // 디버깅용 로그

        try {
          const response = await fetch(
            "http://localhost:3001/create-short-url",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
              body: JSON.stringify({ url: figmaUrl }),
            }
          );

          console.log("API Response:", response); // 디버깅용 로그

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
      } else if (pluginMessage.type === "NO_FRAME_SELECTED") {
        alert("Please select a frame to generate a share link.");
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [authToken]);

  const handleGenerateShortUrl = () => {
    console.log("Generate Short URL button clicked"); // 추가
    setIsLoading(true);
    setShortUrl(null);
    console.log("Sending GET_SHARE_LINK message"); // 추가
    parent.postMessage({ pluginMessage: { type: "GET_SHARE_LINK" } }, "*");
  };

  const handleLogout = () => {
    parent.postMessage({ pluginMessage: { type: "DELETE_TOKEN" } }, "*");
    setAuthToken(null);
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
