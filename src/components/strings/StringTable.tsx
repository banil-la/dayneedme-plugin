import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";

const StringTable: React.FC = () => {
  const [strings, setStrings] = useState<String[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { authToken } = useAuth();

  const serverUrl = getServerUrl();

  const fetchStrings = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/strings`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStrings(data);
    } catch (error) {
      console.error("[StringTable] Error fetching strings:", error);
    }
  };

  useEffect(() => {
    fetchStrings();
  }, []);

  return (
    <div className="recent-urls">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">StringTable</h3>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => fetchStrings()}
        >
          Refresh
        </button>
      </div>
      <p>StringTable</p>
      <p>{JSON.stringify(strings)}</p>
    </div>
  );
};

export default StringTable;
