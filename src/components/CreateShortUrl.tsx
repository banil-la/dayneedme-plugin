import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import copyToClipboard from "../hooks/copyToClipboard";
import { useAuth } from "../context/AuthContext";

const CreateShortUrl: React.FC = () => {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authToken } = useAuth();

  useEffect(() => {
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

    const handleNoFrameSelected = () => {
      alert("Please select a frame to generate a share link.");
      setIsLoading(false);
    };

    const handleShareLinkError = (error: string) => {
      console.error("Error from SHARE_LINK:", error);
      setIsLoading(false);
    };

    on("SHARE_LINK", handleShareLink);
    on("NO_FRAME_SELECTED", handleNoFrameSelected);
    on("SHARE_LINK_ERROR", handleShareLinkError);

    return () => {
      // Clean up event listeners
      on("SHARE_LINK", () => {});
      on("NO_FRAME_SELECTED", () => {});
      on("SHARE_LINK_ERROR", () => {});
    };
  }, [authToken]);

  const handleGenerateShortUrl = () => {
    setIsLoading(true);
    setShortUrl(null);
    emit("GET_SHARE_LINK");
  };

  return (
    <div className="flex flex-col">
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

export default CreateShortUrl;
