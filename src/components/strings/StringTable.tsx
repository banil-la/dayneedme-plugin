import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { emit, on } from "@create-figma-plugin/utilities";
import { getServerUrl } from "../../utils/getServerUrl";

interface StringData {
  id: number;
  content: string;
}

interface ParsedContent {
  kr: string;
  en: string;
}

const StringTable: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [matchingStrings, setMatchingStrings] = useState<StringData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mode, os, product } = useGlobal();
  const { authToken } = useAuth();
  const serverUrl = getServerUrl();

  // mode가 변경될 때마다 선택 상태 확인
  useEffect(() => {
    console.log("[StringTable] Mode changed to:", mode);
    if (mode === "string") {
      console.log("[StringTable] Requesting selected text after mode change");
      emit("GET_SELECTED_TEXT");
    }
  }, [mode]);

  // 선택된 텍스트 감지
  useEffect(() => {
    const checkSelection = () => {
      console.log("[StringTable] Initial selection check");
      emit("GET_SELECTED_TEXT");
    };

    // 초기 선택 확인
    checkSelection();

    // 선택 변경 이벤트 구독
    const unsubscribe = on(
      "SELECTION_CHANGED",
      async (value: string | boolean | null) => {
        console.log("[StringTable] Selection changed:", {
          value,
          type: typeof value,
          mode,
        });

        // String 모드에서는 문자열 또는 null이 전달됨
        if (mode === "string") {
          const text = typeof value === "string" ? value : null;
          console.log("[StringTable] Processing string mode selection:", text);
          setSelectedText(text);
          setMatchingStrings([]); // 선택이 변경되면 결과 초기화

          // 텍스트가 선택되었을 때만 검색
          if (text) {
            setIsLoading(true);
            try {
              const url = `${serverUrl}/api/strings/?search=${encodeURIComponent(
                text
              )}&os=${os}&product=${product}`;
              console.log("[StringTable] Searching text:", text);

              const response = await fetch(url, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                },
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              console.log("[StringTable] Search results:", data);
              setMatchingStrings(data);
            } catch (error) {
              console.error("[StringTable] Error searching strings:", error);
              figma.notify("문자열 검색 중 오류가 발생했습니다", {
                error: true,
              });
            } finally {
              setIsLoading(false);
            }
          }
        } else if (mode === "url") {
          // URL 모드인 경우 선택 상태 초기화
          setSelectedText(null);
          setMatchingStrings([]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [mode, os, product, authToken]); // 의존성 배열 정리

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    figma.notify("텍스트가 클립보드에 복사되었습니다");
  };

  const parseContent = (content: string): ParsedContent => {
    try {
      const parsed = JSON.parse(content);
      return {
        kr: parsed.kr || "",
        en: parsed.en || "",
      };
    } catch (e) {
      console.error("Failed to parse content:", e);
      return { kr: content, en: "" };
    }
  };

  return (
    <div className="string-table">
      {selectedText ? (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">선택된 텍스트</h3>
          <div className="bg-base-200 p-2 rounded flex justify-between items-center">
            <p>{selectedText}</p>
            <button
              onClick={() => handleCopy(selectedText)}
              className="ml-2 p-1 hover:bg-gray-300 rounded"
            >
              복사
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          텍스트 레이어를 선택해주세요
        </p>
      )}

      {isLoading ? (
        <p>검색 중...</p>
      ) : matchingStrings.length > 0 ? (
        <div>
          <h3 className="text-lg font-medium mb-2">일치하는 문자열</h3>
          <ul className="space-y-2">
            {matchingStrings.map((item) => {
              const parsed = parseContent(item.content);
              return (
                <li key={item.id} className="bg-base-200 p-3 rounded">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            KR
                          </span>
                          <p className="font-medium">{parsed.kr}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            EN
                          </span>
                          <p className="text-gray-600">{parsed.en}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCopy(parsed.kr)}
                          className="p-1 hover:bg-gray-300 rounded text-sm"
                          title="한국어 복사"
                        >
                          KR 복사
                        </button>
                        <button
                          onClick={() => handleCopy(parsed.en)}
                          className="p-1 hover:bg-gray-300 rounded text-sm"
                          title="영어 복사"
                        >
                          EN 복사
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        selectedText && <p>일치하는 문자열이 없습니다</p>
      )}
    </div>
  );
};

export default StringTable;
