// src/components/mode/UtilURL.tsx

import { h } from "preact";
import UrlRecents from "../url/UrlRecents";
import { useState, useEffect } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import CreateShortUrl from "../url/UrlShare";
import URLStatus from "../url/status/URLStatus";
import FigmaVersionList from "./FigmaVersionList";

const UtilFigma: React.FC = () => {
  const { mode } = useGlobal();

  if (mode !== "figma-version") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      <URLStatus />
      <FigmaVersionList />
    </div>
  );
};

export default UtilFigma;
