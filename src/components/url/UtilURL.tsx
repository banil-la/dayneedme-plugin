// src/components/mode/UtilURL.tsx

import { h } from "preact";
import UrlRecents from "./UrlRecents";
import { useState, useEffect } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import CreateShortUrl from "./UrlShare";
import URLStatus from "./status/URLStatus";

const UtilURL: React.FC = () => {
  const { mode } = useGlobal();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdateRecentUrls = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (mode !== "url") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      <URLStatus />
      <CreateShortUrl onUpdateRecentUrls={handleUpdateRecentUrls} />
      <UrlRecents refreshKey={refreshKey} />
    </div>
  );
};

export default UtilURL;
