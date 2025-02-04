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
  handler: () => void;
}

export type Mode = "string" | "url";
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
