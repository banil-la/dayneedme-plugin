import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { emit, on } from "@create-figma-plugin/utilities";
import { getServerUrl } from "../../utils/getServerUrl";
import { SearchResult, StringData } from "./string_helper";
import StringItem from "./StringItem";
import copyToClipboard from "../../hooks/copyToClipboard";
import classNames from "classnames";

const StringTable: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [exactMatches, setExactMatches] = useState<StringData[]>([]);
  const [partialMatches, setPartialMatches] = useState<StringData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mode, os, product } = useGlobal();
  const { authToken } = useAuth();
  const serverUrl = getServerUrl();

  // mode가 변경될 때마다 선택 상태 확인
  useEffect(() => {
    // console.log("[StringTable] Mode changed to:", mode);
    if (mode === "string") {
      // console.log("[StringTable] Requesting selected text after mode change");
      emit("GET_SELECTED_TEXT");
    }
  }, [mode]);

  // 선택된 텍스트 감지
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message || typeof message !== "object") return;

      if (message.type === "STRING_SELECTION_CHANGED") {
        // console.log("[StringTable] String selection changed:", message.data);
        const text = message.data;
        setSelectedText(text);
        setExactMatches([]);
        setPartialMatches([]);

        if (text) {
          setIsLoading(true);
          searchText(text).catch(console.error);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    emit("GET_SELECTED_TEXT"); // 초기 선택 상태 확인

    return () => window.removeEventListener("message", handleMessage);
  }, [mode, os, product, authToken]);

  const searchText = async (text: string) => {
    try {
      const url = new URL(`${serverUrl}/api/string/text`);
      url.searchParams.append("text", text);
      url.searchParams.append("os", os);
      url.searchParams.append("product", product);

      // console.log("[StringTable] Searching text:", url.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResult = await response.json();
      // console.log("[StringTable] Search results:", data);
      setExactMatches(data.exact_matched);
      setPartialMatches(data.partial_matched);
    } catch (error) {
      // console.error("[StringTable] Error searching strings:", error);
      figma.notify("문자열 검색 중 오류가 발생했습니다", {
        error: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    emit("SHOW_NOTIFY", { message: "문자열이 클립보드에 복사되었습니다" });
  };

  return (
    <div className="string-table">
      <div className="mb-4">
        <div className="bg-base-100 p-2 rounded flex justify-between items-center">
          <p
            className={classNames(
              "w-full text-center",
              selectedText
                ? "text-black dark:text-white"
                : "text-gray-300 dark:text-gray-300"
            )}
          >
            {selectedText
              ? selectedText
              : "검증을 위한 문자열을 선택해 주세요."}
          </p>
        </div>
      </div>

      {isLoading ? (
        <p>검색 중...</p>
      ) : exactMatches.length > 0 || partialMatches.length > 0 ? (
        <div className="space-y-4">
          {exactMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                정확히 일치하는 문자열
              </h3>
              <ul className="space-y-2">
                {exactMatches.map((item) => (
                  <StringItem key={item.id} item={item} />
                ))}
              </ul>
            </div>
          )}

          {partialMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                검색어를 포함하는 문자열
              </h3>
              <ul className="space-y-2">
                {partialMatches.map((item) => (
                  <StringItem key={item.id} item={item} />
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        selectedText && <p>일치하는 문자열이 없습니다</p>
      )}
    </div>
  );
};

export default StringTable;
