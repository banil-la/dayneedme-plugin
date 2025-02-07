import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import copyToClipboard from "../../hooks/copyToClipboard";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { useGlobal } from "../../context/GlobalContext";

interface UrlShareProps {
  onUpdateRecentUrls: () => void;
}

const UrlShare: React.FC<UrlShareProps> = ({ onUpdateRecentUrls }) => {
  const { authToken } = useAuth();
  const { fileKeyInfo } = useGlobal();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [isFrameSelected, setIsFrameSelected] = useState(false);

  const handleUrlShare = () => {
    emit("GET_SHARE_LINK", {
      authToken,
      fileKey: fileKeyInfo?.fileKey,
      description: description.trim(),
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const [type, data] = event.data.pluginMessage || [];
      if (type === "SELECTION_CHANGED") {
        setIsFrameSelected(data);
      } else if (type === "SHARE_LINK") {
        setShortUrl(data.short_url);
        copyToClipboard(data.short_url);
        onUpdateRecentUrls();
        setIsLoading(false);
        setDescription("");
      } else if (type === "SHARE_LINK_ERROR") {
        setError(data);
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [authToken, onUpdateRecentUrls]);

  const handleGenerateShortUrl = () => {
    if (isLoading) return;
    if (!fileKeyInfo?.fileKey || !fileKeyInfo?.fileName) {
      setError("Please select a file first");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    setIsLoading(true);
    setShortUrl(null);
    handleUrlShare();
  };

  // 버튼 활성화 조건 체크
  const isButtonEnabled =
    !isLoading &&
    fileKeyInfo?.fileKey &&
    fileKeyInfo?.fileName &&
    description.trim().length > 0;

  const placeholderText = isFrameSelected
    ? "설명을 입력하세요"
    : "URL을 공유할 프레임을 선택해 주세요";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder={placeholderText}
          className="flex-1 px-3"
          disabled={!isFrameSelected}
        />
        <button
          onClick={handleGenerateShortUrl}
          disabled={!isButtonEnabled}
          className={`px-4 py-2 rounded btn btn-sm ${
            isButtonEnabled
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {isLoading ? "생성 중..." : "생성"}
        </button>
      </div>
      {shortUrl && (
        <p>
          ✅{" "}
          <a
            className="font-medium text-blue-600 underline"
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortUrl}
          </a>
        </p>
      )}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default UrlShare;
