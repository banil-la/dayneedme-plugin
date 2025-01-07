import { h } from "preact";
import { useGlobal } from "../context/GlobalContext";

const SettingsSelector: React.FC = () => {
  const { os, setOS, product, setProduct } = useGlobal();

  return (
    <div className="settings-selector flex items-center justify-between border-y border-base-200 px-4 py-2">
      <div className="flex gap-2 items-center">
        <label className="block text-sm font-medium text-base">
          운영체제 선택
        </label>
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
          <option value="common">Common</option>
        </select>
      </div>
      <div className="flex gap-2 items-center">
        <label className="block text-sm font-medium text-base">제품 선택</label>
        <select
          value={product}
          onChange={(e) =>
            setProduct(
              (e.target as HTMLSelectElement).value as "adotphone" | "aiphone"
            )
          }
          className="select select-bordered select-xs"
        >
          <option value="adotphone">Adotphone</option>
          <option value="aiphone">Aiphone</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsSelector;
