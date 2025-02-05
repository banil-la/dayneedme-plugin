// src/utils/getServerUrl.ts

import { devServerUrl, prodServerUrl } from "../constants";

export const getServerUrl = (): string => {
  return devServerUrl;
};
