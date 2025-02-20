import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { formatDate } from "../../types";
import { emit } from "@create-figma-plugin/utilities";
import { FigmaHistoryResponse, FigmaVersion } from "./figma_helper";
import FigmaVersionItem from "./FigmaVersionItem";

export default function FigmaVersionList() {
  const { authToken } = useAuth();
  const { fileKeyInfo, setFileKeyInfo } = useGlobal();
  const [history, setHistory] = useState<FigmaHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message?.type === "FILE_KEY_INFO") {
        setFileKeyInfo(message.info);
      }
    };

    window.addEventListener("message", handleMessage);
    emit("CHECK_FILE_KEY");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const fetchHistory = async () => {
    if (!fileKeyInfo?.fileKey) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${getServerUrl()}/api/figma/file/${
          fileKeyInfo.fileKey
        }/history?include-auto-saved=${false}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("히스토리를 불러오는데 실패했습니다.");
      }

      const data = await response.json();

      // 버전 정보에서 label 처리를 수정
      if (data.versions) {
        data.versions = data.versions.map((version: FigmaVersion) => ({
          ...version,
          label: version.is_auto_saved
            ? "Auto-saved version"
            : version.label || "Untitled Version",
        }));
      }

      setHistory(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fileKeyInfo?.fileKey) {
      fetchHistory();
    }
  }, [fileKeyInfo?.fileKey]);

  if (!fileKeyInfo?.fileKey) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>파일 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 파일 정보 헤더 */}
      {history?.file_info && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">{history.file_info.name}</h2>
            <span className="text-sm text-gray-500">
              마지막 수정: {formatDate(history.file_info.last_modified)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span>편집자: {history.file_info.editor.handle}</span>
          </div>
        </div>
      )}

      {/* 필터 컨트롤 */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={fetchHistory}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          새로고침
        </button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-4">
          <p>로딩 중...</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* 버전 목록 */}
      {!isLoading && history?.versions && (
        <div className="space-y-4">
          {history.versions.map((version) => (
            <FigmaVersionItem key={version.id} version={version} />
          ))}
          {history.versions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              버전 히스토리가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
