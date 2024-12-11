// src/components/EnvironmentSwitcher.tsx

import { h } from "preact";
import { useGlobal } from "../context/GlobalContext";

const EnvironmentSwitcher: React.FC = () => {
  const { environment, setEnvironment } = useGlobal();

  return (
    <div className="mb-4">
      <label htmlFor="environment" className="font-medium mr-2">
        Select Environment:
      </label>
      <select
        id="environment"
        value={environment}
        onChange={(e) => setEnvironment(e.currentTarget.value)}
        className="border border-gray-300 rounded px-2 py-1"
      >
        <option value="dev">Development</option>
        <option value="prod">Production</option>
      </select>
    </div>
  );
};

export default EnvironmentSwitcher;
