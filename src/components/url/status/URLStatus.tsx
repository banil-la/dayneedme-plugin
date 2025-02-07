import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useGlobal } from "../../../context/GlobalContext";
import { useAuth } from "../../../context/AuthContext";
import { getServerUrl } from "../../../utils/getServerUrl";
import RegisterFileModal from "./RegisterFileModal";
import SearchFileModal from "./SearchFileModal";
import UrlFigmaStatusView from "./StatusView";

const URLStatus: React.FC = () => {
  const { authToken } = useAuth();
  const { fileKeyInfo, setFileKeyInfo, currentFileName } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFileNameMismatch, setIsFileNameMismatch] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const fetchFileKeyInfo = async () => {
      setIsLoading(true);

      if (!currentFileName) {
        console.log("[URLStatus] No current file name available.");
        setError("현재 파일명을 가져올 수 없습니다.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${getServerUrl()}/api/url/get-file-key?filename=${encodeURIComponent(
            currentFileName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("피그마 파일 정보를 찾지 못했어요.");
        }

        const data = await response.json();
        setFileKeyInfo(data);
      } catch (error) {
        console.error("[URLStatus] Error fetching file key info:", error);
        setError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했어요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileKeyInfo();
  }, [currentFileName, authToken]);

  const handleRegisterClick = () => {
    console.log("[URLStatus] Opening registration modal");
    setIsModalOpen(true);
  };

  const handleSearchClick = () => {
    console.log("[URLStatus] Opening search modal");
    setIsSearchModalOpen(true);
  };

  const handleModalClose = () => {
    console.log("[URLStatus] Closing modal");
    setIsModalOpen(false);
    setIsSearchModalOpen(false);
  };

  const handleFileKeyExtract = async (fileKey: string) => {
    console.log("[URLStatus] handleFileKeyExtract called with:", fileKey);
    try {
      if (!currentFileName) {
        console.error("[URLStatus] Current file name is empty");
        setError("현재 파일명을 가져올 수 없습니다.");
        return;
      }

      console.log("[URLStatus] Registering file:", {
        fileKey,
        fileName: currentFileName,
      });

      const response = await fetch(
        `${getServerUrl()}/api/filekey/register-filekey`,
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
      console.log("[URLStatus] Raw response:", responseText);

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
      console.log("[URLStatus] Registration successful:", data);

      setFileKeyInfo({
        fileName: data.fileName,
        fileKey: data.fileKey,
        isFromDatabase: data.isFromDatabase,
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("[URLStatus] Registration failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  return (
    <UrlFigmaStatusView
      isLoading={isLoading}
      error={error}
      isFileNameMismatch={isFileNameMismatch}
      fileKeyInfo={fileKeyInfo}
      currentFileName={currentFileName}
      onRegisterClick={handleRegisterClick}
      onSearchClick={handleSearchClick}
      onModalClose={handleModalClose}
      isModalOpen={isModalOpen}
      isSearchModalOpen={isSearchModalOpen}
      onFileKeyExtract={handleFileKeyExtract}
    />
  );
};

export default URLStatus;
