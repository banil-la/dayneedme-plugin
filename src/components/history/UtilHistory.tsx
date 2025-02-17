import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import { useAuth } from "../../context/AuthContext";
import { getServerUrl } from "../../utils/getServerUrl";
import { formatDate } from "../../types";
import { HistoryItemProps, HistoryResponseProps } from "./history_helper";
import HistoryItem from "./HistoryItem";

const UtilHome: React.FC = () => {
  const { os, product } = useGlobal();
  const { authToken } = useAuth();
  const [histories, setHistories] = useState<HistoryItemProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistories = async () => {
    if (!authToken) return;

    setLoading(true);
    setError(null);

    try {
      const serverUrl = getServerUrl();
      const response = await fetch(
        `${serverUrl}/api/history/list?os=${os}&product=${product}&page=1&page_size=10`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("히스토리를 불러오는데 실패했습니다.");
      }

      const data: HistoryResponseProps = await response.json();
      setHistories(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, [os, product, authToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-4">
        {histories.map((history) => (
          <HistoryItem history={history} />
        ))}
        {histories.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            히스토리가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default UtilHome;
