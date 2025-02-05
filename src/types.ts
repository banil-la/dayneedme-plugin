// types.ts
import { EventHandler } from "@create-figma-plugin/utilities";

export interface ResizeWindowHandler extends EventHandler {
  name: "RESIZE_WINDOW";
  handler: (windowSize: { width: number; height: number }) => void;
}

export interface LoadTokenHandler extends EventHandler {
  name: "LOAD_TOKEN";
  handler: () => void;
}

export interface SaveTokenHandler extends EventHandler {
  name: "SAVE_TOKEN";
  handler: (token: string) => void;
}

export interface DeleteTokenHandler extends EventHandler {
  name: "DELETE_TOKEN";
  handler: () => void;
}

export interface GetShareLinkHandler extends EventHandler {
  name: "GET_SHARE_LINK";
  handler: (data: {
    authToken: string;
    fileKey: string;
    description: string;
  }) => void;
}

export type Mode = "default" | "string" | "url";
export type OS = "ios" | "android" | "common";
export type Product = "adotphone" | "aiphone";

export interface SaveStringSettingsHandler extends EventHandler {
  name: "SAVE_STRING_SETTINGS";
  handler: (settings: { os: OS; product: Product }) => void;
}

export interface LoadStringSettingsHandler extends EventHandler {
  name: "LOAD_STRING_SETTINGS";
  handler: () => void;
}

export interface ShareLinkErrorHandler extends EventHandler {
  name: "SHARE_LINK_ERROR";
  handler: (error: string) => void;
}

export interface NavigateToNodeHandler extends EventHandler {
  name: "NAVIGATE_TO_NODE";
  handler: (data: { fileKey: string; nodeId: string }) => void;
}

export interface FileKeyInfoHandler extends EventHandler {
  name: "FILE_KEY_INFO";
  handler: (info: {
    fileName: string;
    fileKey: string;
    isFromDatabase: boolean;
  }) => void;
}

export interface FileKeyInfo {
  fileName: string;
  fileKey: string;
  isFromDatabase: boolean;
}

export interface GlobalContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  os: OS;
  setOS: (os: OS) => void;
  product: Product;
  setProduct: (product: Product) => void;
  fileKeyInfo: FileKeyInfo | null;
  setFileKeyInfo: (info: FileKeyInfo | null) => void;
}

export interface GetSelectedTextHandler extends EventHandler {
  name: "GET_SELECTED_TEXT";
  handler: () => void;
}

export interface SelectedTextReceivedHandler extends EventHandler {
  name: "SELECTED_TEXT_RECEIVED";
  handler: (text: string | null) => void;
}

export interface SelectionChangedHandler extends EventHandler {
  name: "SELECTION_CHANGED";
  handler: (text: string | null) => void;
}

export interface SetModeHandler extends EventHandler {
  name: "SET_MODE";
  handler: (mode: Mode) => void;
}
