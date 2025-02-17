import { useState } from "preact/hooks";
import { useGlobal } from "../context/GlobalContext";
import { useAuth } from "../context/AuthContext";
import { getServerUrl } from "../utils/getServerUrl";
import { SearchResult } from "../components/strings/string_helper";

export function useStringSearch() {
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { os, product } = useGlobal();
  const { authToken } = useAuth();

  const searchStrings = async (text: string) => {
    if (!text.trim()) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const url = new URL(`${getServerUrl()}/api/string/text`);
      url.searchParams.append("text", text.trim());
      url.searchParams.append("os", os);
      url.searchParams.append("product", product);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      // console.error("[StringSearch] Error searching:", error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { results, isLoading, searchStrings };
}
