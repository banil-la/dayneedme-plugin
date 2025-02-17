import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit } from "@create-figma-plugin/utilities";

interface ImageNode {
  id: string;
  name: string;
  width: number;
  height: number;
  type: string;
}

const UtilImage: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<ImageNode[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message || typeof message !== "object") return;

      if (message.type === "IMAGE_SELECTION_CHANGED") {
        setSelectedImages(message.data || []);
        setError(null);
      } else if (message.type === "EXPORT_COMPLETE") {
        setIsExporting(false);
        emit("SHOW_NOTIFY", { message: "이미지 추출이 완료되었습니다" });
      } else if (message.type === "EXPORT_ERROR") {
        setIsExporting(false);
        setError(message.error);
      } else if (message.type === "DOWNLOAD_IMAGE") {
        // Uint8Array를 Blob으로 변환
        const blob = new Blob([message.bytes], { type: "image/png" });

        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = message.fileName;

        // 다운로드 트리거
        document.body.appendChild(a);
        a.click();

        // 정리
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    window.addEventListener("message", handleMessage);
    emit("GET_SELECTED_IMAGES");

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleExport = async () => {
    if (selectedImages.length === 0) {
      setError("추출할 이미지를 선택해주세요");
      return;
    }

    setIsExporting(true);
    setError(null);
    emit("EXPORT_IMAGES");
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">이미지 3배수 추출</h2>
        <p className="text-sm text-gray-600">
          선택한 이미지를 3배수 크기로 추출합니다.
          <br />
          추출된 이미지는 자동으로 다운로드됩니다.
        </p>
      </div>

      {selectedImages.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">
            선택된 이미지: {selectedImages.length}개
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto bg-gray-50 rounded p-2">
            {selectedImages.map((image) => (
              <div
                key={image.id}
                className="flex items-center justify-between p-2 bg-white rounded shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs">
                    {image.type.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {image.name || "Unnamed"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(image.width)} x {Math.round(image.height)}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(image.width * 3)} x {Math.round(image.height * 3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-gray-500">추출할 이미지를 선택해주세요</p>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isExporting || selectedImages.length === 0}
        className={`w-full px-4 py-2 rounded ${
          isExporting || selectedImages.length === 0
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isExporting ? "추출 중..." : "3배수로 추출하기"}
      </button>

      {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
    </div>
  );
};

export default UtilImage;
