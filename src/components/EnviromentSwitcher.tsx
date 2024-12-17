// src/components/EnvironmentSwitcher.tsx

import { h } from "preact";
import { Environment, useGlobal } from "../context/GlobalContext";

const EnvironmentSwitcher: React.FC = () => {
  const context = useGlobal();

  if (!context) {
    return null; // GlobalContext가 초기화되지 않으면 아무것도 렌더링하지 않음
  }

  const { environment, setEnvironment } = context;

  return (
    <select
      id="environment"
      value={environment}
      onChange={(e) => setEnvironment(e.currentTarget.value as Environment)}
      className="select select-xs select-bordered w-full max-w-xs"
    >
      <option value="dev">Development</option>
      <option value="prod">Production</option>
    </select>
  );
};

export default EnvironmentSwitcher;
