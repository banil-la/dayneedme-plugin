import { h } from "preact";
import { SearchResult } from "./string_helper";
import StringItem from "./StringItem";

interface StringResultsProps {
  results: SearchResult;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function StringResults({ results, isLoading, emptyMessage = "일치하는 문자열이 없습니다" }: StringResultsProps) {
  if (isLoading) {
    return <p>검색 중...</p>;
  }

  if (!results.exact_matched.length && !results.partial_matched.length) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {results.exact_matched.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">정확히 일치하는 문자열</h3>
          <ul className="space-y-2">
            {results.exact_matched.map((item) => (
              <StringItem key={item.id} item={item}  />
            ))}
          </ul>
        </div>
      )}

      {results.partial_matched.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">검색어를 포함하는 문자열</h3>
          <ul className="space-y-2">
            {results.partial_matched.map((item) => (
              <StringItem key={item.id} item={item}  />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 