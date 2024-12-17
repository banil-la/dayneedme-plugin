// src/utils/getServerUrl.ts

import { devUrl, prodUrl } from "../constants";
import { useGlobal } from "../context/GlobalContext";

export const getServerUrl = (): string => {
  try {
    // 기본값은 production URL
    let serverUrl = prodUrl;

    // GlobalContext에서 environment 가져오기
    const context = useGlobal();

    if (context) {
      const { environment } = context;

      // 개발자가 명시적으로 'dev'로 설정했을 때만 devUrl 반환
      if (environment === "dev") {
        console.info("[getServerUrl] Development mode enabled.");
        serverUrl = devUrl;
      }
    } else {
      console.warn(
        "[getServerUrl] GlobalContext is not ready. Using production URL as default."
      );
    }

    return serverUrl;
  } catch (error) {
    console.error("[getServerUrl] Error retrieving environment:", error);
    return prodUrl; // fallback to production URL
  }
};
