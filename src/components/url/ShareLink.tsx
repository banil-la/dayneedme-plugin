import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import copyToClipboard from "../../hooks/copyToClipboard";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { useGlobal } from "../../context/GlobalContext";

interface ShareLinkProps {
  onUpdateRecentUrls: () => void;
}

const ShareLink: React.FC<ShareLinkProps> = ({ onUpdateRecentUrls }) => {
  const { authToken } = useAuth();
  const { fileKeyInfo } = useGlobal();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");

  const handleShareLink = () => {
    emit("GET_SHARE_LINK", {
      authToken,
      fileKey: fileKeyInfo?.fileKey,
      description: description.trim(),
    });
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const [type, data] = event.data.pluginMessage || [];
      if (type === "SHARE_LINK") {
        setShortUrl(data.short_url);
        copyToClipboard(data.short_url);
        onUpdateRecentUrls();
        setIsLoading(false); // 로딩 상태 해제
      } else if (type === "SHARE_LINK_ERROR") {
        setError(data);
        setIsLoading(false); // 에러 발생 시에도 로딩 상태 해제
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
    handleShareLink();
  };

  // 버튼 활성화 조건 체크
  const isButtonEnabled =
    !isLoading &&
    fileKeyInfo?.fileKey &&
    fileKeyInfo?.fileName &&
    description.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
        placeholder="URL에 대한 설명을 입력하세요"
        className="input input-bordered w-full"
      />
      <button
        onClick={handleGenerateShortUrl}
        disabled={!isButtonEnabled}
        className={`px-4 py-2 rounded text-base font-medium ${
          isButtonEnabled
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-400 text-gray-200 cursor-not-allowed"
        }`}
      >
        {isLoading ? "생성 중..." : "단축 URL 생성하기"}
      </button>
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

export default ShareLink;
