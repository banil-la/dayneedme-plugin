import { h } from "preact";
import { useGlobal } from "../context/GlobalContext";

const SettingsSelector: React.FC = () => {
  const { os, setOS, product, setProduct } = useGlobal();

  return (
    <div className="settings-selector flex items-center justify-between border-y border-base-200 px-4 py-2">
      <div className="flex gap-2 items-center">
        <label className="block text-sm font-medium">OS</label>
        <select
          value={os}
          onChange={(e) =>
            setOS(
              (e.target as HTMLSelectElement).value as
                | "ios"
                | "android"
                | "common"
            )
          }
          className="select select-bordered select-xs"
        >
          <option value="ios">iOS</option>
          <option value="android">Android</option>
          {/* <option value="common">공통</option> */}
        </select>
      </div>
      <div className="flex gap-2 items-center">
        <label className="block text-sm font-medium">PROD</label>
        <select
          value={product}
          onChange={(e) =>
            setProduct(
              (e.target as HTMLSelectElement).value as "adotphone" | "aiphone"
            )
          }
          className="select select-bordered select-xs"
        >
          <option value="adotphone">에이닷전화(구 T전화)</option>
          <option value="aiphone">에이닷 앱 전화</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsSelector;
