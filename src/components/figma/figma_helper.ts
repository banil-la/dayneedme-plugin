export interface FigmaUser {
  handle: string;
  img_url?: string;
  id?: string;
}

export interface FigmaVersion {
  id: string;
  created_at: string;
  label: string;
  description?: string;
  user: FigmaUser;
  is_auto_saved: boolean;
}

export interface FigmaFileInfo {
  name: string;
  last_modified: string;
  thumbnail_url?: string;
  editor: FigmaUser;
}

export interface FigmaHistoryResponse {
  file_info: FigmaFileInfo;
  versions: FigmaVersion[];
}
