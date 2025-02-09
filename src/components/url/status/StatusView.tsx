import { h } from "preact";
import RegisterFileModal from "./RegisterFileModal";
import SearchFileModal from "./SearchFileModal";

interface StatusViewProps {
  isLoading: boolean;
  error: string | null;
  isFileNameMismatch: boolean;
  fileKeyInfo: any;
  currentFileName: string;
  onRegisterClick: () => void;
  onSearchClick: () => void;
  onModalClose: () => void;
  isModalOpen: boolean;
  isSearchModalOpen: boolean;
  onFileKeyExtract: (fileKey: string) => void;
}

const StatusView: React.FC<StatusViewProps> = ({
  isLoading,
  error,
  isFileNameMismatch,
  fileKeyInfo,
  currentFileName,
  onRegisterClick,
  onSearchClick,
  onModalClose,
  isModalOpen,
  isSearchModalOpen,
  onFileKeyExtract,
}) => {
  return (
    <div className="p-2 bg-base-100 rounded">
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
