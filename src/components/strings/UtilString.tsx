import { h } from "preact";
import { useState } from "preact/hooks";
import { useGlobal } from "../../context/GlobalContext";
import classNames from "classnames";
import StringTable from "./StringTable";

interface String {
  id: number;
  string: string;
}

const UtilString: React.FC = () => {
  const { mode } = useGlobal();

  const [strings, setStrings] = useState<String[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className={classNames("p-4", mode === "string" ? "visible" : "hidden")}
    >
      <StringTable />
    </div>
  );
};

export default UtilString;
