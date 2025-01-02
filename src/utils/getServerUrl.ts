// src/utils/getServerUrl.ts

import { devUrl, prodUrl } from "../constants";
import { useGlobal } from "../context/GlobalContext";

export const getServerUrl = (): string => {
  try {
    const { environment } = useGlobal();
    return environment === "dev" ? devUrl : prodUrl;
  } catch (error) {
    console.error("[getServerUrl] Error retrieving environment:", error);
    return prodUrl; // fallback to production URL
  }
};
