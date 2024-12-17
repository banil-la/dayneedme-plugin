// src/components/mode/url/RecentUrls.tsx

import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../../context/AuthContext";
import { getServerUrl } from "../../../utils/getServerUrl";

interface RecentUrl {
  id: number;
  short_url: string;
  created_at: string;
}

interface RecentUrlsProps {
  refreshKey: number; // Triggers re-fetch when this value changes
}

const RecentUrls: React.FC<RecentUrlsProps> = ({ refreshKey }) => {
  const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { authToken } = useAuth();

  useEffect(() => {
    const fetchRecentUrls = async () => {
      setIsLoading(true);
      const serverUrl = getServerUrl();
      try {
        const response = await fetch(`${serverUrl}/recent-urls`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("[RecentUrls] Response error data:", errorData);
          throw new Error(errorData.detail || "Failed to fetch recent URLs");
        }

        const data = await response.json();
        console.log("[RecentUrls] Fetched Data:", data);

        setRecentUrls(
          data.map((item: any) => {
            console.log("[RecentUrls] Processed Item:", {
              id: item.id,
              short_url: item.short_url || "missing-url",
              created_at: item.created_at,
            });

            return {
              id: item.id,
              short_url: item.short_url || "missing-url", // short_url 사용
              created_at: item.created_at,
            };
          })
        );
      } catch (error) {
        console.error("[RecentUrls] Error fetching recent URLs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (authToken) {
      fetchRecentUrls();
    } else {
      console.warn("[RecentUrls] No auth token available.");
    }
  }, [authToken, refreshKey]);

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">Recent Short URLs</h3>
        <p>Loading recent URLs...</p>
      </div>
    );
  }

  if (recentUrls.length === 0) {
    return <p>No recent URLs found.</p>;
  }

  return (
    <div className="recent-urls">
      <h3 className="text-lg font-medium mb-2">Recent Short URLs</h3>
      <ul>
        {recentUrls.map((url) => (
          <li key={url.id} className="mb-1 flex justify-between">
            <a
              href={url.short_url !== "missing-url" ? url.short_url : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {url.short_url !== "missing-url"
                ? url.short_url
                : "URL not available"}
            </a>
            <span className="text-gray-500 text-sm ml-2">
              {new Date(url.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentUrls;
