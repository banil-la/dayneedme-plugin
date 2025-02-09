// src/components/mode/url/UrlRecentss.tsx

import { h, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { useGlobal } from "../../context/GlobalContext";
import UrlItem from "./UrlItem";
import UrlPagination from "./UrlPagination";

interface UrlRecents {
  id: number;
  url: string;
  url_id: string;
  description: string;
  created_at: string;
}

interface UrlRecentssProps {
  refreshKey: number;
}

const UrlRecents: React.FC<UrlRecentssProps> = ({ refreshKey }) => {
  const [UrlRecentss, setUrlRecentss] = useState<UrlRecents[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { authToken } = useAuth();
  const { fileKeyInfo } = useGlobal();
  const serverUrl = getServerUrl();

  const fetchUrlRecentss = async (page: number = 1) => {
    setIsLoading(true);
    console.log("[UrlRecentss] Fetching page:", page);

    try {
      if (!fileKeyInfo?.fileKey) {
        setUrlRecentss([]);
        return;
      }

      const url = `${serverUrl}/api/url?page=${page}&page_size=5&file_key=${fileKeyInfo.fileKey}`;
      console.log("[UrlRecentss] Request URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[UrlRecentss] Response data:", data);

      setUrlRecentss(data.data);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
    } catch (error) {
      console.error("[UrlRecentss] Error fetching recent URLs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createShortUrl = async (url: string, fileKey: string) => {
    try {
      const response = await fetch(`${serverUrl}/api/url/create-short-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          file_key: fileKey,
          description: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create short URL");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating short URL:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (fileKeyInfo?.fileKey) {
      fetchUrlRecentss(1);
    }
  }, [fileKeyInfo?.fileKey, refreshKey]);

  return (
    <div className="border-t border-t-base-300 pt-3">
      <div className="flex justify-between items-center">
        <p className="text-base font-semibold">최근 생성 URL</p>
      </div>

      {isLoading ? (
        <p>Loading recent URLs...</p>
      ) : UrlRecentss.length === 0 ? (
        <p>No recent URLs found.</p>
      ) : (
        <Fragment>
          <ul>
            {UrlRecentss.map((url) => (
              <UrlItem
                key={url.id}
                url={url}
                authToken={authToken}
                onUpdate={() => fetchUrlRecentss(currentPage)}
              />
            ))}
          </ul>

          <UrlPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchUrlRecentss}
          />
        </Fragment>
      )}
    </div>
  );
};

export default UrlRecents;
