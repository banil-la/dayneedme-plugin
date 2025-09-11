// src/context/GlobalContext.tsx

import { createContext, h, JSX } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { emit, on } from "@create-figma-plugin/utilities";
import { Mode, OS, Product, FileKeyInfo, GlobalContextType } from "../types";
import { getServerUrl } from "../utils/getServerUrl";
import { useAuth } from "./AuthContext"; // AuthContext import 추가

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: JSX.Element }) {
  const { authToken } = useAuth();
  const [env, setEnvState] = useState<"dev" | "prod">("dev");
  const [mode, setModeState] = useState<Mode>("inspector");
  const [os, setOS] = useState<OS>("android");
  const [product, setProduct] = useState<Product>("adotphone");
  const [fileKeyInfo, setFileKeyInfo] = useState<FileKeyInfo | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");

  // 로그인 상태가 변경될 때 상태 초기화
  useEffect(() => {
    if (!authToken) {
      setFileKeyInfo(null);
      setCurrentFileName("");
    }
  }, [authToken]);

  // 파일 이름 변경 이벤트 핸들러 - 로그인 상태일 때만 등록
  useEffect(() => {
    if (!authToken) {
      setCurrentFileName(""); // 로그아웃 시 파일명 초기화
      return; // 로그아웃 상태면 이벤트 리스너를 등록하지 않음
    }

    let debounceTimer: NodeJS.Timeout | null = null;

    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (!message || message.type !== "CURRENT_FILENAME") return;

      setCurrentFileName(message.fileName);

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        matchFileKey(message.fileName, authToken);
      }, 300);
    };

    window.addEventListener("message", handleMessage);
    emit("GET_CURRENT_FILENAME");

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.removeEventListener("message", handleMessage);
    };
  }, [authToken]);

  // 파일키 매칭 함수
  const matchFileKey = async (fileName: string, token: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${getServerUrl()}/api/filekey/search?name=${encodeURIComponent(
          fileName
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFileKeyInfo(data);
      } else {
        setFileKeyInfo(null);
      }
    } catch (error) {
      console.error("[GlobalContext] Error matching file key:", error);
      setFileKeyInfo(null);
    }
  };

  // 모드 변경 시 Figma storage에 저장
  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    emit("SAVE_MODE", newMode);
  };
  const setEnv = (newEnv: "dev" | "prod") => {
    setEnvState(newEnv);
    emit("SAVE_ENV", newEnv);
  };

  // 초기 모드 로드
  useEffect(() => {
    emit("LOAD_MODE");

    const handleModeLoaded = (loadedMode: Mode) => {
      setModeState(loadedMode);
    };

    const handleModeChanged = (newMode: Mode) => {
      setModeState(newMode);
    };

    const unsubscribeLoaded = on("MODE_LOADED", handleModeLoaded);
    const unsubscribeChanged = on("MODE_CHANGED", handleModeChanged);

    return () => {
      unsubscribeLoaded();
      unsubscribeChanged();
    };
  }, []);

  // 초기 설정 로드 - 컴포넌트 마운트 시 즉시 실행
  useEffect(() => {
    // 초기 로드
    emit("LOAD_SETTINGS");

    // 설정 로드 이벤트 리스너
    const unsubscribeLoad = on("SETTINGS_LOADED", (settings) => {
      if (settings) {
        // console.log("[GlobalContext] Loading settings:", settings);
        setOS(settings.os);
        setProduct(settings.product);
      }
    });

    // 설정 저장 이벤트 리스너 추가
    const unsubscribeSave = on("SETTINGS_SAVED", (settings) => {
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
    emit("SAVE_SETTINGS", settings);
  }, [os, product]); // os나 product가 변경될 때마다 저장

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
    env,
    setEnv,
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
