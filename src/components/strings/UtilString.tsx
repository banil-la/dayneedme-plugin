import { h } from "preact";
import StringTable from "./StringTable";
import SettingsSelector from "../SettingsSelector";
import { useGlobal } from "../../context/GlobalContext";

interface String {
  id: number;
  string: string;
}

const UtilString: React.FC = () => {
  const { mode } = useGlobal();

  // mode가 string일 때만 StringTable 렌더링 및 API 요청
  if (mode !== "string") {
    return null;
  }

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
