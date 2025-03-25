import { h } from "preact";
import RegisterFileModal from "./RegisterFileModal";
import SearchFileModal from "./SearchFileModal";
import { FileKeyInfo } from "../../../types";

interface StatusViewProps {
  isLoading: boolean;
  error: string | null;
  fileKeyInfo: FileKeyInfo | null;
  currentFileName: string;
  onRegisterClick: () => void;
  onSearchClick: () => void;
  onModalClose: () => void;
  isModalOpen: boolean;
  isSearchModalOpen: boolean;
  onFileKeyExtract: (fileKey: string) => void;
  onRefreshMatch: () => void;
}

const StatusView: React.FC<StatusViewProps> = ({
  isLoading,
  error,
  fileKeyInfo,
  currentFileName,
  onRegisterClick,
  onSearchClick,
  onModalClose,
  isModalOpen,
  isSearchModalOpen,
  onFileKeyExtract,
  onRefreshMatch,
}) => {
  return (
    <div className="bg-base-100 rounded">
      {isLoading ? (
        <p className="text-black text-opacity-50 font-medium">Loading...</p>
      ) : fileKeyInfo ? (
        <div className="flex items-center justify-between">
          <div>
            <span>{fileKeyInfo.fileName}</span>
          </div>
          <button
            onClick={onRefreshMatch}
            className="ml-2 p-1 hover:bg-gray-200 rounded"
            title="매칭 다시 시도"
          >
            🔄
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-red-500 font-medium">
              ⚠ {error || `"${currentFileName}"이 등록되지 않았습니다.`}
            </p>
            <button
              onClick={onRefreshMatch}
              className="ml-2 p-1 hover:bg-gray-200 rounded"
              title="매칭 다시 시도"
            >
              🔄
            </button>
          </div>
          <div className="flex justify-between gap-2">
            <button
              onClick={onSearchClick}
              className="btn btn-xs flex-1 btn-active"
            >
              등록된 피그마 찾기
            </button>
            <button
              onClick={onRegisterClick}
              className="btn btn-xs flex-1 btn-neutral"
            >
              새로 등록하기
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <RegisterFileModal
          onClose={onModalClose}
          onSubmit={onFileKeyExtract}
          currentFileName={currentFileName}
        />
      )}

      {isSearchModalOpen && (
        <SearchFileModal
          onClose={onModalClose}
          currentFileName={currentFileName}
        />
      )}
    </div>
  );
};

export default StatusView;
