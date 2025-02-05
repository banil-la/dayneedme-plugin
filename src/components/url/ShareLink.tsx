import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import copyToClipboard from "../../hooks/copyToClipboard";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";

interface ShareLinkProps {
  onUpdateRecentUrls: () => void;
}

const ShareLink: React.FC<ShareLinkProps> = ({ onUpdateRecentUrls }) => {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { authToken } = useAuth();

  useEffect(() => {
    const handleShareLink = async (figmaUrl: string) => {
      console.log("[ShareLink] Received Figma URL:", figmaUrl);

      try {
        const response = await fetch(
          `${getServerUrl()}/api/url/create-short-url`,
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
        console.log("[ShareLink] Short URL created:", data.short_url);
        setShortUrl(data.short_url);
        copyToClipboard(data.short_url);

        // 기존 URL 여부에 따라 다른 메시지 표시
        const message = data.isExisting
          ? `Existing URL copied: ${data.short_url}`
          : `Short URL created and copied: ${data.short_url}`;
        alert(message);

        onUpdateRecentUrls();
      } catch (error) {
        console.error("[ShareLink] Error creating short URL:", error);
        alert(
          `Error: ${JSON.stringify(error) || "Unable to create short URL"}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    // 에러 핸들러 추가
    const handleError = (error: string) => {
      alert(error);
      setIsLoading(false);
    };

    const unsubscribeError = on("SHARE_LINK_ERROR", handleError);
    const unsubscribeShare = on("SHARE_LINK", handleShareLink);

    return () => {
      unsubscribeError();
      unsubscribeShare();
    };
  }, [authToken, onUpdateRecentUrls]);

  const handleGenerateShortUrl = () => {
    if (isLoading) {
      console.warn("[ShareLink] Already generating a URL, skipping.");
      return;
    }
    console.log("[ShareLink] Generate Short URL button clicked");
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

export default ShareLink;
