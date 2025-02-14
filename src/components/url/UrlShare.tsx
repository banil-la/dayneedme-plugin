import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit } from "@create-figma-plugin/utilities";
import copyToClipboard from "../../hooks/copyToClipboard";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { getServerUrl } from "../../utils/getServerUrl";
import UrlCreated from "./UrlCreated";

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

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      console.log("[UrlShare] Received message:", message);

      if (!message) return;

      if (typeof message === "object" && "type" in message) {
        if (message.type === "SELECTION_CHANGED") {
          console.log("[UrlShare] Selection changed:", message.data);
          setIsFrameSelected(!!message.data);
        } else if (message.type === "SHARE_LINK_RECEIVED") {
          // 피그마로부터 공유 링크를 받으면 API 호출
          if (message.link) {
            const nodeId = message.link;
            handleCreateShortUrl(nodeId, message.description);
          } else {
            setError("공유 링크를 가져올 수 없습니다");
            setIsLoading(false);
          }
        } else if (message.type === "SHARE_LINK_ERROR") {
          setError(message.error);
          setIsLoading(false);
        }
      } else if (Array.isArray(message)) {
        const [type, data] = message;
        if (type === "SELECTION_CHANGED") {
          console.log("[UrlShare] Selection changed (array):", data);
          setIsFrameSelected(!!data);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    emit("GET_SELECTED_TEXT"); // 초기 선택 상태 확인

    return () => window.removeEventListener("message", handleMessage);
  }, [authToken, onUpdateRecentUrls]);

  const handleGenerateShortUrl = async () => {
    console.log("[UrlShare] handleGenerateShortUrl called");
    if (isLoading) return;
    if (!fileKeyInfo?.fileKey || !fileKeyInfo?.fileName) {
      setError("파일을 먼저 선택해주세요");
      return;
    }
    if (!isFrameSelected) {
      setError("프레임을 선택해주세요");
      return;
    }
    if (!description.trim()) {
      setError("설명을 입력해주세요");
      return;
    }
  
    setIsLoading(true);
    setShortUrl(null);
    setError(null);
  
    // 피그마에 공유 링크 요청
    console.log("[UrlShare] GET_SHARE_LINK");
    emit("GET_SHARE_LINK", { description: description.trim() });
  };

  
  const handleCreateShortUrl = async (nodeId: string, desc: string) => {
    try {
      const response = await fetch(`${getServerUrl()}/api/url/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node_id: `${fileKeyInfo?.fileName}?node-id=${nodeId}`,
          file_key: fileKeyInfo?.fileKey,
          description: desc,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "URL 생성에 실패했습니다");
      }
  
      const data = await response.json();
      setShortUrl(data.short_url);
      copyToClipboard(data.short_url);
      onUpdateRecentUrls();
      setIsLoading(false);
      setDescription(""); // API 요청 성공 후 description 초기화
    } catch (error) {
      console.error("[UrlShare] Error creating URL:", error);
      setError(
        error instanceof Error ? error.message : "URL 생성에 실패했습니다"
      );
      setIsLoading(false);
    }
  };
  
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
      {shortUrl && <UrlCreated shortUrl={shortUrl} />}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default UrlShare;
