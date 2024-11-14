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
