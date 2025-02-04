// src/components/mode/UtilURL.tsx

import { h } from "preact";
import CreateShortUrl from "../url/CreateShortUrl";
import RecentUrls from "../url/RecentUrls";
import { useState } from "preact/hooks";

const UtilURL: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdateRecentUrls = () => {
    console.log("[UrlManager] Updating recent URLs");
    setRefreshKey((prev) => prev + 1);
  };
  // Component UI
  return (
    <div class="p-4">
      <RecentUrls refreshKey={refreshKey} />
      {/* <CreateShortUrl onUpdateRecentUrls={handleUpdateRecentUrls} /> */}
    </div>
  );
};

export default UtilURL;
