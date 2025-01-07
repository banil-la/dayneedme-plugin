// src/context/GlobalContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useState } from "preact/hooks";

export type Mode = "string" | "url";

interface GlobalContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ComponentChildren;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<Mode>("url");

  return (
    <GlobalContext.Provider value={{ mode, setMode }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
