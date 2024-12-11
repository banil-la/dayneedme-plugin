import { useGlobal } from "../context/GlobalContext";

export const getServerUrl = (): string => {
  try {
    const { environment } = useGlobal();

    switch (environment) {
      case "dev":
        return "http://localhost:8080";
      case "prod":
        return "https://py-prod-adot.vercel.app";
      default:
        console.warn(`[getServerUrl] Unknown environment: ${environment}`);
        return "http://localhost:8080"; // 기본값으로 로컬 서버 반환
    }
  } catch (error) {
    console.error("[getServerUrl] Failed to retrieve environment:", error);
    return "http://localhost:8080"; // fallback to a default value
  }
};
