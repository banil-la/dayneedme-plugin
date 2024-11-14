import { EventHandler } from "@create-figma-plugin/utilities";

export interface ResizeWindowHandler extends EventHandler {
  name: "RESIZE_WINDOW";
  handler: (windowSize: { width: number; height: number }) => void;
}

export interface LoadTokenHandler {
  name: "LOAD_TOKEN";
  handler: () => void;
}

export interface SaveTokenHandler {
  name: "SAVE_TOKEN";
  handler: (token: string) => void;
}

export interface DeleteTokenHandler {
  name: "DELETE_TOKEN";
  handler: () => void;
}

export interface GetShareLinkHandler {
  name: "GET_SHARE_LINK";
  handler: () => void;
}
