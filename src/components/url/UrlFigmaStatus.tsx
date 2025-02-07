import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import RegisterFileModal from "./RegisterFileModal";

const UrlFigmaStatus: React.FC = () => {
  const { authToken } = useAuth();
  const { fileKeyInfo, setFileKeyInfo, currentFileName } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFileNameMismatch, setIsFileNameMismatch] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // fileKeyInfo 초기화 감지 및 타임아웃 처리
  useEffect(() => {
    if (!currentFileName) {
      return; // 파일명이 없으면 처리하지 않음
    }

    setIsLoading(false); // 파일명이 있으면 로딩 상태 해제

    if (fileKeyInfo !== null) {
      setError(null);
      if (fileKeyInfo.fileName !== currentFileName) {
        setIsFileNameMismatch(true);
        setError(
          `현재 파일 "${currentFileName}"와(과) 선택한 파일이 다릅니다.`
        );
      } else {
        setIsFileNameMismatch(false);
      }
    } else {
      setError(`"${currentFileName}"이 등록되지 않았습니다.`);
    }
  }, [fileKeyInfo, currentFileName]);

  const handleRegisterClick = () => {
    console.log("[UrlFigmaStatus] Opening registration modal");
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    console.log("[UrlFigmaStatus] Closing registration modal");
    setIsModalOpen(false);
  };

  const handleFileKeyExtract = async (fileKey: string) => {
    console.log("[UrlFigmaStatus] handleFileKeyExtract called with:", fileKey);
    try {
      if (!currentFileName) {
        console.error("[UrlFigmaStatus] Current file name is empty");
        setError("현재 파일명을 가져올 수 없습니다.");
        return;
      }

      console.log("[UrlFigmaStatus] Registering file:", {
        fileKey,
        fileName: currentFileName,
      });

      // fileKey와 fileName을 서버에 등록
      const response = await fetch(
        `${getServerUrl()}/api/url/register-filekey`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileKey,
            fileName: currentFileName.trim(),
          }),
        }
      );

      const responseText = await response.text();
      console.log("[UrlFigmaStatus] Raw response:", responseText);

      if (!response.ok) {
        let errorDetail;
        try {
          const errorData = JSON.parse(responseText);
          errorDetail = errorData.detail;
        } catch {
          errorDetail = responseText;
        }
        throw new Error(errorDetail || "파일 등록에 실패했습니다.");
      }

      const data = JSON.parse(responseText);
      console.log("[UrlFigmaStatus] Registration successful:", data);

      // 성공 시 fileKeyInfo 업데이트
      setFileKeyInfo({
        fileName: data.fileName,
        fileKey: data.fileKey,
        isFromDatabase: data.isFromDatabase,
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("[UrlFigmaStatus] Registration failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  return (
    <div className="p-2 bg-gray-100 rounded">
      {isLoading ? (
        <p className="text-black text-opacity-50 font-medium">Loading...</p>
      ) : fileKeyInfo?.isFromDatabase && !isFileNameMismatch ? (
        <p>
          <span className="font-medium">✓ File Name:</span>{" "}
          <span>{fileKeyInfo.fileName}</span>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-red-500 font-medium">
            ⚠ {error || `"${currentFileName}"이 등록되지 않았습니다.`}
          </p>
          <button
            onClick={handleRegisterClick}
            className="text-sm text-blue-500 hover:text-blue-700 font-medium"
          >
            파일 등록하기
          </button>
        </div>
      )}

      {isModalOpen && (
        <RegisterFileModal
          onClose={handleModalClose}
          onSubmit={handleFileKeyExtract}
          currentFileName={currentFileName}
        />
      )}
    </div>
  );
};

export default UrlFigmaStatus;
