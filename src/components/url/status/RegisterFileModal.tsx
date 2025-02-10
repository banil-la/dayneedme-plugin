import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on, once } from "@create-figma-plugin/utilities";
import { getServerUrl } from "../../../utils/getServerUrl";
import { useAuth } from "../../../context/AuthContext";

interface RegisterFileModalProps {
  onClose: () => void;
  onSubmit: (url: string) => void;
  currentFileName: string;
}

const RegisterFileModal: React.FC<RegisterFileModalProps> = ({
  onClose,
  onSubmit,
  currentFileName,
}) => {
  const { authToken } = useAuth();
  const [url, setUrl] = useState("");
  const [extractedKey, setExtractedKey] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState(currentFileName);

  // URL이 변경될 때마다 파일키 추출 시도
  useEffect(() => {
    if (!url) {
      setExtractedKey(null);
      return;
    }

    try {
      // file/ 또는 design/ 패턴 모두 처리
      const match = url.match(/(?:file|design)\/([^/?]+)/);
      if (match) {
        setExtractedKey(match[1]);
        console.log("[RegisterFileModal] Extracted file key:", match[1]);
      } else {
        setExtractedKey(null);
      }
    } catch (error) {
      setExtractedKey(null);
    }
  }, [url]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log(
      "[RegisterFileModal] Submit clicked, extractedKey:",
      extractedKey
    );
    if (extractedKey) {
      refreshCurrentFileName(); // 파일명 새로 고침
      console.log(
        "[RegisterFileModal] Calling onSubmit with key:",
        extractedKey
      );
      onSubmit(extractedKey);
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
          "[RegisterFileModal] Received current file name:",
          message.fileName
        );
        setCurrentFile(message.fileName);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleRegister = async () => {
    if (!authToken) {
      console.error("No auth token available");
      return;
    }

    try {
      // 파일키 등록
      const response = await fetch(`${getServerUrl()}/api/filekey/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: extractedKey,
          title: currentFileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register file key");
      }

      const data = await response.json();
      // 등록 성공 처리
    } catch (error) {
      console.error("Error registering file key:", error);
    }
  };

  const getShareLink = async () => {
    try {
      emit("GET_SHARE_LINK");
    } catch (error) {
      console.error("Error requesting share link:", error);
    }
  };

  useEffect(() => {
    const handleShareLink = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message?.type === "SHARE_LINK_RECEIVED") {
        if (message.link) {
          setUrl(message.link);
        } else {
          console.log("No share link available");
        }
      }
    };

    window.addEventListener("message", handleShareLink);
    return () => window.removeEventListener("message", handleShareLink);
  }, []);

  // 자동으로 공유 링크 가져오기 시도
  useEffect(() => {
    getShareLink();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-base-100 rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-lg font-bold mb-4">파일 등록</h2>

        <div className="mb-4">
          <p className="text-sm font-medium mb-1">현재 파일:</p>
          <p className="text-sm bg-base-300 p-2 rounded">{currentFile}</p>
          <button
            onClick={refreshCurrentFileName}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium mt-2"
          >
            파일명 새로고침
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            1. Figma 파일의 <strong>Share</strong> 버튼을 클릭하세요.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            2. <strong>Copy link</strong> 버튼을 클릭하여 링크를 복사하세요.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            3. 아래에 복사한 링크를 붙여넣으세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              console.log(
                "[RegisterFileModal] URL input changed:",
                e.currentTarget.value
              );
              setUrl(e.currentTarget.value);
            }}
            placeholder="https://www.figma.com/file/... 또는 design/..."
            className="w-full p-2 border rounded mb-4"
          />

          {/* 추출된 파일키 표시 */}
          {url && (
            <div className="mb-4 p-3 bg-base-300 rounded">
              <p className="text-sm text-gray-600">추출된 파일키:</p>
              <p className="font-mono text-sm">
                {extractedKey || "유효하지 않은 URL입니다"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!extractedKey}
              onClick={(e) => {
                console.log("[RegisterFileModal] Register button clicked");
                handleSubmit(e as Event);
              }}
              className={`px-4 py-2 rounded text-sm ${
                extractedKey
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterFileModal;
