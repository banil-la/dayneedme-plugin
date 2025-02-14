import { h } from "preact";
import { useState } from "preact/hooks";
import { SearchResult } from "./string_helper";
import { StringResults } from "./StringResults";
import StringSearch from "./StringSearch";

interface SearchResultsTableProps {
  results: SearchResult | null;
  isLoading: boolean;
  onSearch: (text: string) => Promise<void>;
}

export function SearchResultsTable({ results, isLoading, onSearch }: SearchResultsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async (text: string) => {
    if (text.trim()) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
    }
    await onSearch(text);
  };

  return (
    <div className={`inset-x-0 transition-all duration-200 shadow-lg rounded-t-lg p-4 z-10`}>
      <div className="sticky top-0 bg-base-100">
        <StringSearch onSearch={handleSearch} />
      </div>
      {isExpanded && (
        <div className="overflow-auto">
          <StringResults 
            results={results || { exact_matched: [], partial_matched: [] }}
            isLoading={isLoading}
            emptyMessage="검색 결과가 없습니다"
          />
        </div>
      )}
    </div>
  );
} 