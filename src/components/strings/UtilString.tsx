import { h } from "preact";
import { SelectionTable } from "./SelectionTable";
import { SearchResultsTable } from "./SearchResultsTable";
import { useStringSearch } from "../../hooks/useStringSearch";

export default function UtilString() {
  const { results, isLoading, searchStrings } = useStringSearch();

  return (
    <div className="flex flex-col">
      <SearchResultsTable
        results={results}
        isLoading={isLoading}
        onSearch={searchStrings}
      />
      <div className="p-4">
        <SelectionTable />
      </div>
    </div>
  );
}
