import { h } from "preact";
import { useGlobal } from "../context/GlobalContext";
import { Mode } from "../types";
import classNames from "classnames";
import {
  LuLandmark,
  LuLink2,
  LuBookA,
  LuImageDown,
  LuFigma,
} from "react-icons/lu";

const TABS = [
  {
    id: "history" as const,
    icon: <LuLandmark size={`1.5em`} />,
    // icon: <IconHome />,
    label: "기록",
  },
  {
    id: "string" as const,
    icon: <LuBookA size={`1.5em`} />,
    label: "문자열",
  },
  {
    id: "url" as const,
    icon: <LuLink2 size={`1.5em`} />,
    label: "공유",
  },
  {
    id: "image" as const,
    icon: <LuImageDown size={`1.5em`} />,
    label: "추출",
  },
  {
    id: "figma" as const,
    icon: <LuFigma size={`1.5em`} />,
    label: "피그마",
  },
];

const UtilTab = ({ utilMode }: { utilMode: Mode }) => {
  const { mode, setMode } = useGlobal();
  const tab = TABS.find((t) => t.id === utilMode);

  return (
    <button
      role="tab"
      className={classNames(
        "flex items-center gap-2 p-3 w-full border-l-2 hover:bg-gray-50 transition-colors",
        utilMode === mode
          ? "border-blue-500 bg-blue-50 text-blue-600"
          : "border-transparent"
      )}
      onClick={() => setMode(utilMode)}
      aria-selected={utilMode === mode}
    >
      {tab?.icon}
      {/* <span>{tab?.label}</span> */}
    </button>
  );
};

const Utils: React.FC = () => {
  return (
    <div role="tablist" className="flex flex-col border-r h-full">
      {TABS.map((tab) => (
        <UtilTab key={tab.id} utilMode={tab.id} />
      ))}
    </div>
  );
};

export default Utils;
