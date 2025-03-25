import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useAuth } from "../../../context/AuthContext";
import { useGlobal } from "../../../context/GlobalContext";
import { getServerUrl } from "../../../utils/getServerUrl";
import { emit } from "@create-figma-plugin/utilities";
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
  const { fileKeyInfo } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<FileKeyItem[]>([]);

  useEffect(() => {
    const loadFileList = async () => {
      try {
        const response = await fetch(`${getServerUrl()}/api/filekey/list`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

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

  useEffect(() => {
    // 초기 로딩 시 현재 파일명 가져오기
    refreshCurrentFileName();

    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message?.type === "CURRENT_FILENAME") {
        // console.log(
        //   "[SearchFileModal] Received current file name:",
        //   message.fileName
        // );
        if (message.fileName) {
          setError(null);
        } else {
          setError("현재 파일명을 가져올 수 없습니다. 새로고침을 눌러주세요.");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const refreshCurrentFileName = () => {
    // console.log("[SearchFileModal] Refreshing current file name");
    setError(null);
    emit("GET_CURRENT_FILENAME");
  };

  const handleSelect = async (fileKey: string, fileName: string) => {
    if (!currentFileName) {
      setError(
        "현재 파일명을 가져올 수 없습니다. 새로고침 후 다시 시도해주세요."
      );
      return;
    }

    const confirmUpdate = confirm(
      `Supabase에 등록된 파일명을 현재 파일명 '${currentFileName}'으로 변경하시겠습니까?`
    );

    if (confirmUpdate) {
      try {
        const response = await fetch(
          `${getServerUrl()}/api/filekey/${fileKey}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: fileKey,
              title: currentFileName,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("파일명 업데이트에 실패했습니다.");
        }

        onClose();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "파일명 업데이트에 실패했습니다."
        );
      }
    }
  };

  const options = fileList.map((file) => ({
    value: file.id,
    label: file.title,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-lg font-bold mb-4">등록된 피그마 찾기</h2>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">현재 파일:</p>
            <button
              onClick={refreshCurrentFileName}
              className="text-sm text-blue-500 hover:text-blue-700 font-medium"
              title="파일명 새로고침"
            >
              🔄 새로고침
            </button>
          </div>
          {currentFileName ? (
            <p className="text-sm bg-gray-100 p-2 rounded">{currentFileName}</p>
          ) : (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
              파일명을 가져올 수 없습니다. 새로고침을 눌러주세요.
            </p>
          )}
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
          isDisabled={!currentFileName}
        />

        {error && (
          <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

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
