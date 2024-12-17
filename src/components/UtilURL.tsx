// src/components/mode/UtilURL.tsx

import { h } from "preact";
import CreateShortUrl from "./mode/url/CreateShortUrl";
import { useGlobal } from "../context/GlobalContext";
import classNames from "classnames";
import RecentUrls from "./mode/url/RecentUrls";
import { useState } from "preact/hooks";
import FileSelector from "./mode/url/FileSelector";

const UtilURL: React.FC = () => {
  const { mode } = useGlobal();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdateRecentUrls = () => {
    console.log("[UrlManager] Updating recent URLs");
    setRefreshKey((prev) => prev + 1);
  };
  // Component UI
  return (
    <div
      className={classNames("p-4", mode === "url" ? "visible" : "invisible")}
    >
      <FileSelector />
      <RecentUrls refreshKey={refreshKey} />
      <CreateShortUrl onUpdateRecentUrls={handleUpdateRecentUrls} />
    </div>
  );
};

export default UtilURL;
