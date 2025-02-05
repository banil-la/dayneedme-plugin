// src/components/mode/url/RecentUrls.tsx

import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { serviceUrl } from "../../constants";
import { emit } from "@create-figma-plugin/utilities";
import { useGlobal } from "../../context/GlobalContext";

interface RecentUrl {
  id: number;
  url: string;
  url_id: string | null;
  node_id: string;
  file_key: string;
  created_at: string;
  description: string | null;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const year = date.getFullYear().toString().slice(2); // YY
  const month = String(date.getMonth() + 1).padStart(2, "0"); // MM
  const day = String(date.getDate()).padStart(2, "0"); // DD

  const hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = String(hours % 12 || 12).padStart(2, "0"); // 12시간제
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${ampm} ${displayHours}:${minutes}`;
};

const RecentUrls: React.FC<RecentUrlsProps> = ({ refreshKey }) => {
  const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { authToken } = useAuth();
  const { fileKeyInfo } = useGlobal();
  const serverUrl = getServerUrl();

  const fetchRecentUrls = async (page: number = 1) => {
    setIsLoading(true);
    console.log("[RecentUrls] Fetching page:", page);

    try {
      if (!fileKeyInfo?.fileKey) {
        setRecentUrls([]);
        return;
      }

      const url = `${serverUrl}/api/url/recent-urls?page=${page}&page_size=5&file_key=${fileKeyInfo.fileKey}`;
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
    if (fileKeyInfo?.fileKey) {
      fetchRecentUrls(1);
    }
  }, [fileKeyInfo?.fileKey, refreshKey]);

  return (
    <div className="border-t border-t-base-300 pt-3">
      <div className="flex justify-between items-center">
        <p className="text-base font-semibold">최근 생성 URL</p>
      </div>

      {isLoading ? (
        <p>Loading recent URLs...</p>
      ) : recentUrls.length === 0 ? (
        <p>No recent URLs found.</p>
      ) : (
        <Fragment>
          <ul>
            {recentUrls.map((url) => (
              <li
                key={url.id}
                className="my-2 p-3 bg-gray-100 rounded flex flex-col"
              >
                <a
                  href={`https://www.figma.com/design/${url.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-blue-500 hover:underline"
                >
                  {`https://dayneed.me/s/${url.url_id}`}
                </a>
                <span>{url.description}</span>
                <span className="text-sm text-gray-500">
                  {formatDate(url.created_at)}
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
