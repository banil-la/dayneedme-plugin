// src/components/utils/Utils.tabs-xs
import { h } from "preact";
import { useGlobal } from "../context/GlobalContext";
import { Mode } from "../types";
import classNames from "classnames";
import { IconHome, IconLink, IconTable } from "./assets/UtilsIcon";

const TABS = [
  {
    id: "default" as const,
    icon: <IconHome />,
    label: "기본",
  },
  {
    id: "string" as const,
    icon: <IconTable />,
    label: "문자열 검색",
  },
  {
    id: "url" as const,
    icon: <IconLink />,
    label: "공유 링크",
  },
];

const UtilTab = ({ utilMode }: { utilMode: Mode }) => {
  const { mode, setMode } = useGlobal();
  const tab = TABS.find((t) => t.id === utilMode);

  return (
    <button
      role="tab"
      className={classNames("tab", utilMode === mode && "tab-active")}
      onClick={() => setMode(utilMode)}
      aria-selected={utilMode === mode}
    >
      {tab?.icon}
      <span className="sr-only">{tab?.label}</span>
    </button>
  );
};

const Utils: React.FC = () => {
  return (
    <div role="tablist" className="tabs tabs-bordered">
      {TABS.map((tab) => (
        <UtilTab key={tab.id} utilMode={tab.id} />
      ))}
    </div>
  );
};

export default Utils;
