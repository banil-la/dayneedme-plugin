// src/components/mode/UtilURL.tsx

import { h } from "preact";
import RecentUrls from "./RecentUrls";
import { useState } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import CreateShortUrl from "./ShareLink";

const UtilURL: React.FC = () => {
  const { mode } = useGlobal();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdateRecentUrls = () => {
    console.log("[UrlManager] Updating recent URLs");
    setRefreshKey((prev) => prev + 1);
  };

  if (mode !== "url") {
    return null;
  }

  return (
    <div className="p-4">
      <RecentUrls refreshKey={refreshKey} />
      <CreateShortUrl onUpdateRecentUrls={handleUpdateRecentUrls} />
    </div>
  );
};

export default UtilURL;
