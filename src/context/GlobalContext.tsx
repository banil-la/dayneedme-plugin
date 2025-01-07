// src/context/GlobalContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useState } from "preact/hooks";

export type Mode = "string" | "url";
export type OS = "ios" | "android" | "common";
export type Product = "adotphone" | "aiphone";

interface GlobalContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  os: OS;
  setOS: (os: OS) => void;
  product: Product;
  setProduct: (product: Product) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ComponentChildren;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<Mode>("url");
  const [os, setOS] = useState<OS>("common");
  const [product, setProduct] = useState<Product>("adotphone");

  return (
    <GlobalContext.Provider
      value={{ mode, setMode, os, setOS, product, setProduct }}
    >
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
