// src/context/GlobalContext.tsx

import { createContext, h, JSX } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import { Mode, OS, Product, FileKeyInfo, GlobalContextType } from "../types";

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: JSX.Element }) {
  const [mode, setModeState] = useState<Mode>("history");
  const [os, setOS] = useState<OS>("ios");
  const [product, setProduct] = useState<Product>("adotphone");
  const [fileKeyInfo, setFileKeyInfo] = useState<FileKeyInfo | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");

  // 모드 변경 시 Figma storage에 저장
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    emit("SAVE_MODE", newMode);
  };

  // 초기 모드 로드
  useEffect(() => {
    emit("LOAD_MODE");

    const handleModeLoaded = (loadedMode: Mode) => {
      setModeState(loadedMode);
    };

    on("MODE_LOADED", handleModeLoaded);
    return () => {
      // cleanup
    };
  }, []);

  // 모드 변경 시 이벤트 발송
  useEffect(() => {
    emit("MODE_CHANGED", mode);
  }, [mode]);

  // 초기 설정 로드 - 컴포넌트 마운트 시 즉시 실행
  useEffect(() => {
    // 초기 로드
    emit("LOAD_STRING_SETTINGS");

    // 설정 로드 이벤트 리스너
    const unsubscribeLoad = on("STRING_SETTINGS_LOADED", (settings) => {
      if (settings) {
        // console.log("[GlobalContext] Loading settings:", settings);
        setOS(settings.os);
        setProduct(settings.product);
      }
    });

    // 설정 저장 이벤트 리스너 추가
    const unsubscribeSave = on("STRING_SETTINGS_SAVED", (settings) => {
      // console.log("[GlobalContext] Settings saved:", settings);
    });

    return () => {
      unsubscribeLoad();
      unsubscribeSave(); // cleanup
    };
  }, []);

  // 설정 변경 시 저장
  useEffect(() => {
    const settings = { os, product };
    // console.log("[GlobalContext] Saving settings:", settings);
    emit("SAVE_STRING_SETTINGS", settings);
  }, [os, product]); // os나 product가 변경될 때마다 저장

  // 메시지 핸들러 설정
  useEffect(() => {
    // console.log("[GlobalContext] Setting up message handlers");

    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message) return;

      switch (message.type) {
        case "CURRENT_FILENAME":
          // console.log("[GlobalContext] Received file name:", message.fileName);
          setCurrentFileName(message.fileName);
          break;
        case "FILE_KEY_INFO":
          // console.log("[GlobalContext] Received file key info:", message.info);
          setFileKeyInfo(message.info);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const value = {
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
  };

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
