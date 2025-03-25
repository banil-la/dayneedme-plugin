import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

interface ComponentNode {
  id: string;
  name: string;
  description: string;
  type: string;
  thumbnail: Uint8Array | null;
}

interface ComponentCardProps {
  component: ComponentNode;
}

const UtilFigmaIndex: React.FC = () => {
  const [components, setComponents] = useState<ComponentNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    console.log("[UI] Setting up component listeners");

    const handleMessage = (event: MessageEvent) => {
      console.log("[UI] Raw message event:", event);

      // Figma 플러그인 메시지 구조 확인
      if (!event.data || !event.data.pluginMessage) {
        console.warn("[UI] Invalid message structure:", event.data);
        return;
      }

      const message = event.data.pluginMessage;
      console.log("[UI] Plugin message:", message);

      if (!message.type) {
        console.warn("[UI] Message has no type:", message);
        return;
      }

      const { type, data, error: errorMessage } = message;
      console.log("[UI] Processing message:", { type, data, errorMessage });

      switch (type) {
        case "COMPONENTS_BATCH":
          console.log("[UI] Processing batch:", data);
          setComponents((prev) => {
            const newComponents = [...prev, ...data];
            console.log("[UI] Updated components:", newComponents.length);
            return newComponents;
          });
          setLoadedCount(message.current);
          setTotalCount(message.total);
          break;

        case "COMPONENTS_LOADED":
          console.log("[UI] Processing loaded:", data);
          setComponents(data);
          setLoadedCount(data.length);
          setTotalCount(data.length);
          setIsLoading(false);
          break;

        case "COMPONENTS_ERROR":
          console.error("[UI] Processing error:", errorMessage);
          setError(errorMessage);
          setIsLoading(false);
          break;

        default:
          console.warn("[UI] Unknown message type:", type);
      }
    };

    // window.onmessage 이벤트 리스너 등록
    window.addEventListener("message", handleMessage);

    // 초기 로딩 시작
    console.log("[UI] Starting initial component load");
    setIsLoading(true);
    setError(null);
    setLoadedCount(0);
    setComponents([]);
    emit("GET_COMPONENTS");

    return () => {
      console.log("[UI] Cleaning up component listeners");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleRefresh = () => {
    console.log("[UI] Manual refresh triggered");
    setIsLoading(true);
    setError(null);
    setLoadedCount(0);
    setComponents([]);
    emit("GET_COMPONENTS");
  };

  const handleComponentClick = (componentId: string) => {
    emit("SELECT_COMPONENT", componentId);
  };

  const getThumbnailUrl = (bytes: Uint8Array | null): string | undefined => {
    if (!bytes) return undefined;
    const blob = new Blob([bytes], { type: "image/png" });
    return URL.createObjectURL(blob);
  };

  const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
    const handleMove = () => {
      emit("SELECT_COMPONENT", component.id);
    };

    const handleClone = () => {
      emit("CLONE_COMPONENT", component.id);
    };

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="aspect-video bg-gray-100 relative">
          {component.thumbnail ? (
            <img
              src={getThumbnailUrl(component.thumbnail) || ""}
              alt={component.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No thumbnail
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
            {component.name}
          </h3>
          {component.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2 flex-1">
              {component.description}
            </p>
          )}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={handleMove}
              className="flex-1 btn btn-xs btn-ghost"
            >
              이동
            </button>
            <button
              onClick={handleClone}
              className="flex-1 btn btn-xs btn-ghost"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>
          컴포넌트를 불러오는 중입니다... ({loadedCount}/{totalCount}개 불러옴)
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg m-4">{error}</div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          컴포넌트 라이브러리 ({totalCount}개)
        </h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          새로고침
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {components.map((component) => (
          <ComponentCard key={component.id} component={component} />
        ))}
      </div>

      {components.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          컴포넌트가 없습니다.
        </div>
      )}
    </div>
  );
};

export default UtilFigmaIndex;
