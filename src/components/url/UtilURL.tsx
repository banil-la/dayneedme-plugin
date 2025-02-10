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
  const [fileKeyInfo, setFileKeyInfo] = useState<{
    fileName: string;
    fileKey: string;
  } | null>(null);

  const handleUpdateRecentUrls = () => {
    console.log("[UrlManager] Updating recent URLs");
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const handleFileKeyInfo = (event: MessageEvent) => {
      console.log("[UtilURL] Received message:", event.data.pluginMessage);

      if (event.data.pluginMessage?.type === "FILE_KEY_INFO") {
        console.log(
          "[UtilURL] Setting file key info:",
          event.data.pluginMessage.info
        );
        setFileKeyInfo(event.data.pluginMessage.info);
      }
    };

    console.log("[UtilURL] Adding message listener");
    window.addEventListener("message", handleFileKeyInfo);
    return () => {
      console.log("[UtilURL] Removing message listener");
      window.removeEventListener("message", handleFileKeyInfo);
    };
  }, []);

  if (mode !== "url") {
    return null;
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <URLStatus />
      <CreateShortUrl onUpdateRecentUrls={handleUpdateRecentUrls} />
      <UrlRecents refreshKey={refreshKey} />
    </div>
  );
};

export default UtilURL;
