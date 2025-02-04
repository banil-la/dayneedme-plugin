import { h } from "preact";
import { useState } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import classNames from "classnames";
import StringTable from "./StringTable";
import SettingsSelector from "../SettingsSelector";

interface String {
  id: number;
  string: string;
}

const UtilString: React.FC = () => {
  return (
    <div className="flex flex-col">
      <SettingsSelector />
      <div className="p-4">
        <StringTable />
      </div>
    </div>
  );
};

export default UtilString;
