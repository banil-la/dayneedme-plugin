import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { on } from "@create-figma-plugin/utilities";
import { StringResults } from "./StringResults";
import { useStringSearch } from "../../hooks/useStringSearch";

export function SelectionTable() {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const { results, isLoading, searchStrings } = useStringSearch();

  useEffect(() => {
    const unsubscribe = on("SELECTION_CHANGED", (value: string | null) => {
      setSelectedText(value);
      if (value) {
        searchStrings(value);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!selectedText) {
    return (
      <div className="bg-base-100 p-2 rounded">
        <p className="text-center text-gray-500">검증을 위한 문자열을 선택해 주세요.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="bg-base-100 p-2 rounded">
          <p className="text-center">{selectedText}</p>
        </div>
      </div>
      <StringResults 
        results={results || { exact_matched: [], partial_matched: [] }}
        isLoading={isLoading}
      />
    </div>
  );
} 