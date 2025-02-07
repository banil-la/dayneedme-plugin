// src/context/GlobalContext.tsx

import { createContext, h } from "preact";
import { ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import { Mode, OS, Product, FileKeyInfo } from "../types";

interface GlobalContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  os: OS;
  setOS: (os: OS) => void;
  product: Product;
  setProduct: (product: Product) => void;
  fileKeyInfo: FileKeyInfo | null;
  setFileKeyInfo: (info: FileKeyInfo | null) => void;
  currentFileName: string;
  setCurrentFileName: (fileName: string) => void;
}

export const GlobalContext = createContext<GlobalContextType | undefined>(
  undefined
);

interface GlobalProviderProps {
  children: ComponentChildren;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>("url");
  const [os, setOS] = useState<OS>("ios");
  const [product, setProduct] = useState<Product>("adotphone");
  const [fileKeyInfo, setFileKeyInfo] = useState<FileKeyInfo | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");

  // 메시지 핸들러 설정
  useEffect(() => {
    console.log("[GlobalContext] Setting up message handlers");

    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message) return;

      switch (message.type) {
        case "CURRENT_FILENAME":
          console.log("[GlobalContext] Received file name:", message.fileName);
          setCurrentFileName(message.fileName);
          break;
        case "FILE_KEY_INFO":
          console.log("[GlobalContext] Received file key info:", message.info);
          setFileKeyInfo(message.info);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 초기 설정 로드
  useEffect(() => {
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

  const setMode = (newMode: Mode) => {
    emit("SET_MODE", newMode);
    setModeState(newMode);
  };

  return (
    <GlobalContext.Provider
      value={{
        mode,
        setMode,
        os,
        setOS,
        product,
        setProduct,
        fileKeyInfo,
        setFileKeyInfo,
        currentFileName,
        setCurrentFileName,
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
