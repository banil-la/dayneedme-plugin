import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import copyToClipboard from "../../../hooks/copyToClipboard";
import { useAuth } from "../../../context/AuthContext";
import { getServerUrl } from "../../../utils/getServerUrl";

interface CreateShortUrlProps {
  onUpdateRecentUrls: () => void; // Callback to update recent URLs
}

const CreateShortUrl: React.FC<CreateShortUrlProps> = ({
  onUpdateRecentUrls,
}) => {
  const [shortUrl, setShortUrl] = useState<string | null>(null); // Stores the generated short URL
  const [isLoading, setIsLoading] = useState(false); // Indicates loading state for button
  const { authToken } = useAuth(); // Auth token from the context

  useEffect(() => {
    const handleShareLink = async (figmaUrl: string) => {
      console.log("[CreateShortUrl] Received Figma URL:", figmaUrl);

      try {
        const response = await fetch(
          `${getServerUrl()}/api/url/create-short-url`, // Dynamic URL
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ url: figmaUrl }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to create short URL");
        }

        const data = await response.json();
        console.log("[CreateShortUrl] Short URL created:", data.short_url);
        setShortUrl(data.short_url);
        copyToClipboard(data.short_url);
        alert(`Short URL created and copied: ${data.short_url}`);

        // Trigger recent URLs update
        onUpdateRecentUrls();
      } catch (error) {
        console.error("[CreateShortUrl] Error creating short URL:", error);
        alert(
          `Error: ${JSON.stringify(error) || "Unable to create short URL"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Register listener
    on("SHARE_LINK", handleShareLink);

    // Cleanup listener on component unmount or dependency change
    return () => {
      console.log("[CreateShortUrl] Cleaning up SHARE_LINK listener");
      on("SHARE_LINK", () => {}); // Remove previous listener
    };
  }, [authToken, onUpdateRecentUrls]);

  const handleGenerateShortUrl = () => {
    if (isLoading) {
      console.warn("[CreateShortUrl] Already generating a URL, skipping.");
      return;
    }
    console.log("[CreateShortUrl] Generate Short URL button clicked");
    setIsLoading(true);
    setShortUrl(null);
    emit("GET_SHARE_LINK");
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {shortUrl && (
        <div className="mt-4">
          <p className="font-medium">
            Short URL:{" "}
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </p>
        </div>
      )}
      <button
        onClick={handleGenerateShortUrl}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "Generating..." : "Generate Short URL"}
      </button>
    </div>
  );
};

export default CreateShortUrl;
