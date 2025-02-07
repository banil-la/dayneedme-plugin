import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useAuth } from "../../../context/AuthContext";
import { useGlobal } from "../../../context/GlobalContext";
import { getServerUrl } from "../../../utils/getServerUrl";
import { emit, on } from "@create-figma-plugin/utilities";
import Select from "react-select";

interface SearchFileModalProps {
  onClose: () => void;
  currentFileName: string;
}

interface FileKeyItem {
  id: string;
  title: string;
}

const SearchFileModal: React.FC<SearchFileModalProps> = ({
  onClose,
  currentFileName,
}) => {
  const { authToken } = useAuth();
  const { setFileKeyInfo } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<FileKeyItem[]>([]);
  const [currentFile, setCurrentFile] = useState(currentFileName);

  // 등록된 파일 목록 로드
  useEffect(() => {
    const loadFileList = async () => {
      try {
        const response = await fetch(
          `${getServerUrl()}/api/filekey/available-filekeys`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("파일 목록을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setFileList(data);
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

    loadFileList();
  }, [authToken]);

  const handleSelect = async (fileKey: string, fileName: string) => {
    const confirmUpdate = confirm(
      `Supabase에 등록된 파일명을 현재 파일명 '${currentFile}'으로 변경하시겠습니까?`
    );

    if (confirmUpdate) {
      try {
        const response = await fetch(
          `${getServerUrl()}/api/filekey/update-filekey`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileKey,
              fileName: currentFile,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("파일명 업데이트에 실패했습니다.");
        }

        const data = await response.json();
        console.log("[SearchFileModal] File name updated successfully:", data);
        setFileKeyInfo({
          fileName: currentFile,
          fileKey,
          isFromDatabase: true,
        });
        onClose();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        );
      }
    }
  };

  const refreshCurrentFileName = () => {
    emit("GET_CURRENT_FILENAME");
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message?.type === "CURRENT_FILENAME") {
        console.log(
          "[SearchFileModal] Received current file name:",
          message.fileName
        );
        setCurrentFile(message.fileName);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const options = fileList.map((file) => ({
    value: file.id,
    label: file.title,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-lg font-bold mb-4">등록된 피그마 찾기</h2>

        <div className="mb-4">
          <p className="text-sm font-medium mb-1">현재 파일:</p>
          <p className="text-sm bg-gray-100 p-2 rounded">{currentFile}</p>
          <button
            onClick={refreshCurrentFileName}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium mt-2"
          >
            파일명 새로고침
          </button>
        </div>

        <Select
          options={options}
          isLoading={isLoading}
          onChange={(selectedOption) => {
            if (selectedOption) {
              const { value, label } = selectedOption as {
                value: string;
                label: string;
              };
              handleSelect(value, label);
            }
          }}
          placeholder="파일명 선택..."
          className="mb-4"
        />

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFileModal;
