// components/CreateShortUrl.tsx

import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import copyToClipboard from "../hooks/copyToClipboard";
import { useAuth } from "../context/AuthContext"; // Authentication context

const CreateShortUrl: React.FC = () => {
  // State variables
  const [shortUrl, setShortUrl] = useState<string | null>(null); // Stores the generated short URL
  const [isLoading, setIsLoading] = useState(false); // Indicates loading state for button
  const { authToken } = useAuth(); // Auth token from the context

  useEffect(() => {
    // Event handler: Receives the Figma frame URL from the main process
    const handleShareLink = async (figmaUrl: string) => {
      console.log("[CreateShortUrl] Received Figma URL:", figmaUrl);

      try {
        // Send the URL to the backend to generate a short URL
        const response = await fetch("http://localhost:8080/create-short-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Auth token included
          },
          body: JSON.stringify({ url: figmaUrl }), // Send Figma URL as payload
        });

        console.log("[CreateShortUrl] Backend response:", response);

        if (!response.ok) {
          // If the response is not successful, handle the error
          const error = await response.json();
          throw new Error(error.detail || "Failed to create short URL");
        }

        // Parse the backend's response
        const data = await response.json();
        console.log("[CreateShortUrl] Short URL created:", data.short_url);

        // Update state with the new short URL
        setShortUrl(data.short_url);
        copyToClipboard(data.short_url); // Copy the URL to clipboard
        alert(`Short URL created and copied: ${data.short_url}`);
      } catch (error) {
        // Error handling for failed requests
        console.error("[CreateShortUrl] Error creating short URL:", error);
        alert(
          `Error: ${JSON.stringify(error) || "Unable to create short URL"}`
        );
      } finally {
        // Reset the loading state
        setIsLoading(false);
      }
    };

    // Event handler: No frame selected in Figma
    const handleNoFrameSelected = () => {
      alert("Please select a frame to generate a share link.");
      setIsLoading(false);
    };

    // Event handler: Share link error from the backend
    const handleShareLinkError = (error: string) => {
      console.error("[CreateShortUrl] Error from SHARE_LINK event:", error);
      alert(`Error: ${error}`);
      setIsLoading(false);
    };

    // Register event listeners
    on("SHARE_LINK", handleShareLink);
    on("NO_FRAME_SELECTED", handleNoFrameSelected);
    on("SHARE_LINK_ERROR", handleShareLinkError);

    // Cleanup function: Unregister event listeners on component unmount
    return () => {
      console.log("[CreateShortUrl] Cleaning up event listeners");
      on("SHARE_LINK", () => {});
      on("NO_FRAME_SELECTED", () => {});
      on("SHARE_LINK_ERROR", () => {});
    };
  }, [authToken]); // Re-register listeners if authToken changes

  // Trigger short URL generation
  const handleGenerateShortUrl = () => {
    console.log("[CreateShortUrl] Generate Short URL button clicked");
    setIsLoading(true); // Set loading state
    setShortUrl(null); // Reset previous short URL
    emit("GET_SHARE_LINK"); // Emit event to main process to fetch Figma frame URL
  };

  // Component UI
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
        disabled={isLoading} // Disable button while loading
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? "Generating..." : "Generate Short URL"}
      </button>
    </div>
  );
};

export default CreateShortUrl;
