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
      const serverUrl = getServerUrl(); // Dynamically get the server URL based on environment
      console.log("[RecentUrls] Server URL:", serverUrl); // 디버깅용 로그
      try {
        console.log("[RecentUrls] Fetching recent URLs from", serverUrl);
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
        console.log("[RecentUrls] Fetched data:", data);

        setRecentUrls(
          data.map((item: any) => ({
            id: item.id,
            short_url: `https://dayneed.me/${item.url_id}`,
            created_at: item.created_at,
          }))
        );
      } catch (error) {
        console.error("[RecentUrls] Error fetching recent URLs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    console.log("AuthToken:", authToken ? "exist" : "not exist"); // 추가
    if (authToken) {
      fetchRecentUrls();
    } else {
      console.warn("[RecentUrls] No auth token available.");
    }
  }, [authToken, refreshKey]); // Triggers re-fetch when refreshKey changes

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-2">RECENTURLS: {recentUrls}</h3>
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
        {recentUrls && recentUrls.length > 0 ? (
          recentUrls.map((url) => (
            <li key={url.id} className="mb-1 flex justify-between">
              <a
                href={url.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {url.short_url}
              </a>
              <span className="text-gray-500 text-sm ml-2">
                {new Date(url.created_at).toLocaleString()}
              </span>
            </li>
          ))
        ) : (
          <p>No recent URLs found.</p>
        )}
      </ul>
    </div>
  );
};

export default RecentUrls;
