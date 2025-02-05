import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";

interface FileKeyOption {
  title: string;
  id: string;
}

const FileKeySelector: React.FC = () => {
  const { authToken } = useAuth();
  const { fileKeyInfo, setFileKeyInfo } = useGlobal();
  const [availableFileKeys, setAvailableFileKeys] = useState<FileKeyOption[]>(
    []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  // 사용 가능한 파일키 목록 로드
  useEffect(() => {
    const fetchFileKeys = async () => {
      try {
        const response = await fetch(
          `${getServerUrl()}/api/url/available-filekeys`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch file keys");
        const data = await response.json();
        setAvailableFileKeys(data);
      } catch (error) {
        console.error("[FileKeySelector] Error:", error);
      }
    };

    fetchFileKeys();
  }, [authToken]);

  const handleTitleChange = async (newTitle: string) => {
    const selected = availableFileKeys.find((fk) => fk.title === newTitle);
    if (selected) {
      setFileKeyInfo({
        fileName: selected.title,
        fileKey: selected.id,
        isFromDatabase: true,
      });
    }
    setSelectedTitle(newTitle);
  };

  return (
    <div className="p-2 bg-gray-100 rounded flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-sm">
          <span className="font-medium">
            {fileKeyInfo?.isFromDatabase ? "✓" : "⚠"} File Name:
          </span>{" "}
          {fileKeyInfo?.fileName || "Not set"}
        </p>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {(isEditing || !fileKeyInfo?.fileName) && (
        <select
          value={selectedTitle}
          onChange={(e) =>
            handleTitleChange((e.target as HTMLSelectElement).value)
          }
          className="select select-bordered select-sm w-full"
        >
          <option value="">Select a file</option>
          {availableFileKeys.map((fk) => (
            <option key={fk.id} value={fk.title}>
              {fk.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default FileKeySelector;
