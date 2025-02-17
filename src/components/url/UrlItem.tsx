import { h } from "preact";
import { formatDate } from "../../types";
import { useState } from "preact/hooks";
import { getServerUrl } from "../../utils/getServerUrl";

interface UrlItemProps {
  url: {
    id: number;
    url: string;
    url_id: string;
    description: string;
    created_at: string;
  };
  authToken: string | null;
  onUpdate: () => void;
}

const UrlItem: React.FC<UrlItemProps> = ({ url, authToken, onUpdate }) => {
  if (!authToken) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(url.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    try {
      // console.log("[UrlItem] Updating description:", description.trim());

      const response = await fetch(`${getServerUrl()}/api/url/${url.url_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description.trim() }),
      });

      const data = await response.json();
      // console.log("[UrlItem] Update response:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update description");
      }

      setIsEditing(false);
      // 성공 후 즉시 UI 업데이트
      url.description = description.trim();
      // 목록 새로고침
      onUpdate();
    } catch (error) {
      // console.error("[UrlItem] Error:", error);
      alert("설명 수정에 실패했습니다.");
      // 실패 시 원래 설명으로 복원
      setDescription(url.description);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${getServerUrl()}/api/url/${url.url_id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete URL");
      }

      onUpdate();
    } catch (error) {
      // console.error("[UrlItem] Error:", error);
      alert("URL 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <li className="my-2 bg-base-100 rounded flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <a
          href={`https://www.figma.com/design/${url.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base text-blue-500 hover:underline"
        >
          {`https://banil.la/s/${url.url_id}`}
        </a>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-blue-500 hover:text-blue-700"
            disabled={isLoading}
          >
            {isEditing ? "취소" : "수정"}
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-700"
            disabled={isLoading}
          >
            삭제
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            className="flex-1 text-sm px-2 py-1 border rounded"
            placeholder="설명을 입력하세요"
          />
          <button
            onClick={handleUpdate}
            className="text-xs text-blue-500 hover:text-blue-700"
            disabled={isLoading}
          >
            저장
          </button>
        </div>
      ) : (
        <span>{description}</span>
      )}

      <span className="text-sm text-gray-500">
        {formatDate(url.created_at)}
      </span>
    </li>
  );
};

export default UrlItem;
