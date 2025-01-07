// src/components/mode/url/RecentUrls.tsx

import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { serviceUrl } from "../../constants";

interface RecentUrl {
  id: number;
  url_id: string | null;
  created_at: string;
}

interface UrlResponse {
  data: RecentUrl[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface RecentUrlsProps {
  refreshKey: number;
}

const RecentUrls: React.FC<RecentUrlsProps> = ({ refreshKey }) => {
  const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { authToken } = useAuth();
  const serverUrl = getServerUrl();

  const fetchRecentUrls = async (page: number = 1) => {
    setIsLoading(true);
    console.log("[RecentUrls] Fetching page:", page);

    try {
      const url = `${serverUrl}/api/url/recent-urls?page=${page}&page_size=5`;
      console.log("[RecentUrls] Request URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UrlResponse = await response.json();
      console.log("[RecentUrls] Response data:", data);

      setRecentUrls(data.data);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);

      console.log("[RecentUrls] Updated state:", {
        dataLength: data.data.length,
        totalPages: data.total_pages,
        currentPage: data.page,
      });
    } catch (error) {
      console.error("[RecentUrls] Error fetching recent URLs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchRecentUrls(1);
    }
  }, [authToken, refreshKey, serverUrl]);

  return (
    <div className="recent-urls">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Short URLs</h3>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => fetchRecentUrls(1)}
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p>Loading recent URLs...</p>
      ) : recentUrls.length === 0 ? (
        <p>No recent URLs found.</p>
      ) : (
        <Fragment>
          <ul>
            {recentUrls.map((url) => (
              <li key={url.id} className="mb-1 flex justify-between">
                <a
                  href={url.url_id ? `${serviceUrl}/s/${url.url_id}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {url.url_id
                    ? `${serviceUrl}/s/${url.url_id}`
                    : "URL not available"}
                </a>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(url.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-xs"
                onClick={() => fetchRecentUrls(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="flex items-center">
                {currentPage} / {totalPages}
              </span>
              <button
                className="btn btn-xs"
                onClick={() => fetchRecentUrls(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default RecentUrls;
