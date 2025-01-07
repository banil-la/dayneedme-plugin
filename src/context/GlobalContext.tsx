// src/context/GlobalContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";

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

  useEffect(() => {
    // 초기 설정 로드
    emit("LOAD_STRING_SETTINGS");

    const handleSettingsLoaded = (event: MessageEvent) => {
      const { type, settings } = event.data.pluginMessage || {};
      if (type === "STRING_SETTINGS_LOADED" && settings) {
        setOS(settings.os);
        setProduct(settings.product);
      }
    };

    window.addEventListener("message", handleSettingsLoaded);
    return () => window.removeEventListener("message", handleSettingsLoaded);
  }, []);

  // OS나 Product가 변경될 때마다 저장
  useEffect(() => {
    emit("SAVE_STRING_SETTINGS", { os, product });
  }, [os, product]);

  return (
    <GlobalContext.Provider
      value={{
        mode,
        setMode,
        os,
        setOS,
        product,
        setProduct,
      }}
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
