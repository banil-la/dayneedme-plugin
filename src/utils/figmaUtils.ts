// src/utils/figmaUtils.ts

import { getServerUrl } from "./getServerUrl";

const serverUrl = getServerUrl();

// 유틸리티 함수들
export const getCurrentFileName = () => figma.root.name;

export const sendCurrentFileName = () => {
  const fileName = getCurrentFileName();
  figma.ui.postMessage({ type: "CURRENT_FILENAME", fileName });
};

export const handleError = (context: string, error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  figma.ui.postMessage({
    type: `${context.toUpperCase()}_ERROR`,
    error: errorMessage,
  });
  return errorMessage;
};

export function isValidToken(token: any): token is string {
  return typeof token === "string" && token.length > 0;
}

export async function checkFileKey(authToken: string) {
  const fileName = getCurrentFileName();

  try {
    const url = `${serverUrl}/api/filekey/search?name=${encodeURIComponent(
      fileName
    )}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[checkFileKey] Response data:", data);

    figma.ui.postMessage({
      type: "FILE_KEY_INFO",
      info: {
        fileName: data.fileName,
        fileKey: data.fileKey,
      },
    });
  } catch (error) {
    handleError("checkFileKey", error);
  }
}
