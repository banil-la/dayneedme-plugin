import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useGlobal } from "../../../context/GlobalContext";
import { useAuth } from "../../../context/AuthContext";
import { getServerUrl } from "../../../utils/getServerUrl";
import UrlFigmaStatusView from "./StatusView";

const URLStatus: React.FC = () => {
  const { authToken } = useAuth();
  const { fileKeyInfo, setFileKeyInfo, currentFileName } = useGlobal();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFileNameMismatch, setIsFileNameMismatch] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const fetchFileKeyInfo = async () => {
    setIsLoading(true);
    setError(null);

    if (!currentFileName) {
      // console.log("[URLStatus] No current file name available.");
      setError("현재 파일명을 가져올 수 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${getServerUrl()}/api/filekey/search?name=${encodeURIComponent(
          currentFileName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        setFileKeyInfo(null);
        throw new Error("피그마 파일 정보를 찾지 못했어요.");
      }

      const data = await response.json();
      if (data) {
        setFileKeyInfo(data);
      } else {
        setFileKeyInfo(null);
      }
    } catch (error) {
      // console.error("[URLStatus] Error fetching file key info:", error);
      setError(
        error instanceof Error ? error.message : "알 수 없는 오류가 발생했어요."
      );
      setFileKeyInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFileKeyInfo();
  }, [currentFileName, authToken]);

  const handleRegisterClick = () => {
    // console.log("[URLStatus] Opening registration modal");
    setIsModalOpen(true);
  };

  const handleSearchClick = () => {
    // console.log("[URLStatus] Opening search modal");
    setIsSearchModalOpen(true);
  };

  const handleModalClose = () => {
    // console.log("[URLStatus] Closing modal");
    setIsModalOpen(false);
    setIsSearchModalOpen(false);
  };

  const handleRefreshMatch = async () => {
    // console.log("[URLStatus] Refreshing file key match");
    await fetchFileKeyInfo();
  };

  const handleFileKeyExtract = async (fileKey: string) => {
    // console.log("[URLStatus] handleFileKeyExtract called with:", fileKey);
    try {
      if (!currentFileName) {
        // console.error("[URLStatus] Current file name is empty");
        setError("현재 파일명을 가져올 수 없습니다.");
        return;
      }

      const requestData = {
        id: fileKey,
        title: currentFileName,
      };
      // console.log("[URLStatus] Sending request with data:", requestData);

      const response = await fetch(`${getServerUrl()}/api/filekey/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseText = await response.text();
      // console.log("[URLStatus] Raw response:", responseText);

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
      // console.log("[URLStatus] Registration successful:", data);

      setFileKeyInfo(data);
      // console.log("[URLStatus] FileKeyInfo updated");

      setIsModalOpen(false);

      // 파일키 등록 후 자동으로 파일명 검색 시도
      await fetchFileKeyInfo();
    } catch (error) {
      // console.error("[URLStatus] Registration failed:", error);
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
      onRefreshMatch={handleRefreshMatch}
    />
  );
};

export default URLStatus;
