import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../../context/AuthContext";
import { getServerUrl } from "../../../utils/getServerUrl";
import StringFilter from "./StringFilter";

interface StringData {
  id: number;
  // ... other string properties
}

const StringList: React.FC = () => {
  const [strings, setStrings] = useState<StringData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { authToken } = useAuth();
  const serverUrl = getServerUrl();

  const fetchStrings = async (os?: string, product?: string) => {
    setIsLoading(true);
    try {
      let url = `${serverUrl}/api/strings`;
      const params = new URLSearchParams();
      if (os) params.append("os", os);
      if (product) params.append("product", product);
      if (params.toString()) url += `?${params.toString()}`;

      console.log("[StringList] Fetching URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStrings(data);
    } catch (error) {
      console.error("[StringList] Error fetching strings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (os: string, product: string) => {
    fetchStrings(os || undefined, product || undefined);
  };

  useEffect(() => {
    if (authToken) {
      fetchStrings();
    }
  }, [authToken]);

  return (
    <div className="string-list">
      <StringFilter onFilterChange={handleFilterChange} />

      {isLoading ? (
        <p>Loading strings...</p>
      ) : strings.length === 0 ? (
        <p>No strings found.</p>
      ) : (
        <ul>
          {strings.map((str) => (
            <li key={str.id}>{/* Render string data */}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StringList;
