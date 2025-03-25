import { h } from "preact";
import { useState } from "preact/hooks";
import { useGlobal } from "../../../context/GlobalContext";
import { useAuth } from "../../../context/AuthContext";
import { getServerUrl } from "../../../utils/getServerUrl";
import UrlFigmaStatusView from "./StatusView";

const URLStatus: React.FC = () => {
  const { fileKeyInfo, currentFileName } = useGlobal();
  const { authToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsSearchModalOpen(false);
  };

  const handleFileKeyExtract = async (fileKey: string) => {
    try {
      if (!currentFileName) {
        setError("현재 파일명을 가져올 수 없습니다.");
        return;
      }

      const requestData = {
        id: fileKey,
        title: currentFileName,
      };

      const response = await fetch(`${getServerUrl()}/api/filekey/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("파일 등록에 실패했습니다.");
      }

      setIsModalOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "파일 등록에 실패했습니다."
      );
    }
  };

  return (
    <UrlFigmaStatusView
      isLoading={isLoading}
      error={error}
      fileKeyInfo={fileKeyInfo}
      currentFileName={currentFileName}
      onRegisterClick={() => setIsModalOpen(true)}
      onSearchClick={() => setIsSearchModalOpen(true)}
      onModalClose={handleModalClose}
      isModalOpen={isModalOpen}
      isSearchModalOpen={isSearchModalOpen}
      onFileKeyExtract={handleFileKeyExtract}
      onRefreshMatch={() => {}}
    />
  );
};

export default URLStatus;
