import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { useGlobal } from "../../context/GlobalContext";
import { emit, on } from "@create-figma-plugin/utilities";
import { getServerUrl } from "../../utils/getServerUrl";

interface StringData {
  id: number;
  string: string;
  os: string;
  product: string;
}

const StringTable: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [matchingStrings, setMatchingStrings] = useState<StringData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mode } = useGlobal();
  const { os, product } = useGlobal();
  const { authToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const serverUrl = getServerUrl();

  // 선택된 텍스트 감지
  useEffect(() => {
    const checkSelection = () => {
      emit("GET_SELECTED_TEXT");
    };

    // 초기 선택 확인
    checkSelection();

    // 선택 변경 이벤트 구독
    const unsubscribe = on("SELECTION_CHANGED", (text: string | null) => {
      setSelectedText(text); // text가 null이면 선택 해제된 상태
      if (text === null) {
        setMatchingStrings([]); // 선택 해제 시 검색 결과도 초기화
      } else {
        searchString(text);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [authToken, os, product]); // selectedText 의존성 제거

  useEffect(() => {
    // mode가 string일 때만 API 요청
    if (mode === "string") {
      searchStrings(searchTerm, os, product, authToken);
    }
  }, [mode, searchTerm, os, product, authToken]);

  // 문자열 검색
  const searchString = async (text: string) => {
    console.log("[StringTable] Searching for text:", text);
    setIsLoading(true);
    try {
      const url = `${serverUrl}/api/strings/?search=${encodeURIComponent(
        text
      )}&os=${os}&product=${product}`;
      console.log("[StringTable] Request URL:", url);

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
    } finally {
      setIsLoading(false);
    }
  };

  // searchStrings 함수 추가
  const searchStrings = async (
    searchTerm: string,
    os: string,
    product: string,
    authToken: string | null
  ) => {
    if (!searchTerm) return;

    setIsLoading(true);
    try {
      const url = `${serverUrl}/api/strings/?search=${encodeURIComponent(
        searchTerm
      )}&os=${os}&product=${product}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatchingStrings(data);
    } catch (error) {
      console.error("[StringTable] Error searching strings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="string-table">
      {selectedText ? (
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Selected Text</h3>
          <p className="bg-base-200 p-2 rounded">{selectedText}</p>
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
          <h3 className="text-lg font-medium mb-2">Matching Strings</h3>
          <ul className="space-y-2">
            {matchingStrings.map((item) => (
              <li key={item.id} className="bg-base-200 p-2 rounded">
                <p>{item.string}</p>
                <div className="text-sm text-gray-500">
                  {item.os} | {item.product}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        selectedText && <p>일치하는 문자열이 없습니다</p>
      )}
    </div>
  );
};

export default StringTable;
