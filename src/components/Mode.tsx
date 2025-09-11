import { h } from "preact";
import { useGlobal } from "../context/GlobalContext";
import { Mode } from "../types";
import classNames from "classnames";
import {
  LuLink2,
  LuBookA,
  LuAccessibility,
  LuSquareDashedMousePointer,
} from "react-icons/lu";

const TABS = [
  {
    id: "inspector" as const,
    icon: <LuSquareDashedMousePointer size={`1.5em`} />,
    label: "Inspector",
  },
  {
    id: "accessibility" as const,
    icon: <LuAccessibility size={`1.5em`} />,
    label: "Accessibility",
  },
  {
    id: "string" as const,
    icon: <LuBookA size={`1.5em`} />,
    label: "String",
  },
  {
    id: "url" as const,
    icon: <LuLink2 size={`1.5em`} />,
    label: "Share",
  },
  // {
  //   id: "image" as const,
  //   icon: <LuImageDown size={`1.5em`} />,
  //   label: "Extract",
  // },
  // {
  //   id: "figma-version" as const,
  //   icon: <LuHistory size={`1.5em`} />,
  //   label: "Version",
  // },
  // {
  //   id: "figma-index" as const,
  //   icon: <LuListCollapse size={`1.5em`} />,
  //   label: "Index",
  // },
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
    <div role="tablist" className="flex flex-col h-full">
      {TABS.map((tab) => (
        <UtilTab key={tab.id} utilMode={tab.id} />
      ))}
    </div>
  );
};

export default Utils;
