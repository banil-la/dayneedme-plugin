// src/components/utils/Utils.tabs-xs
import { h } from "preact";
import { Mode, useGlobal } from "../context/GlobalContext";
import classNames from "classnames";
import { IconCompress, IconTable } from "./assets/UtilsIcon";

const UtilTab = ({ utilMode }: { utilMode: Mode }) => {
  const { mode, setMode } = useGlobal();

  const handleMode = (utilMode: Mode) => {
    setMode(utilMode);
  };
  const getIcon = (utilMode: Mode) => {
    switch (utilMode) {
      case "string":
        return <IconTable />;
      case "url":
        return <IconCompress />;
      default:
        break;
    }
  };
  return (
    <a
      role="tab"
      className={classNames("tab", utilMode === mode && "tab-active")}
      onClick={() => handleMode(utilMode)}
    >
      {getIcon(utilMode)}
    </a>
  );
};

const Utils: React.FC = () => {
  return (
    <div role="tablist" className="tabs tabs-bordered">
      <UtilTab utilMode="string" />
      <UtilTab utilMode="url" />
    </div>
  );
};

export default Utils;
