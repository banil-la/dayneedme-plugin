import { OS, Product } from "../../types";

export interface HistoryMetadata {
  search_query?: string;
  result_count?: number;
  [key: string]: any;
}

export interface HistoryItemProps {
  id: number;
  content: string;
  date: string;
  editor: string;
  from: string;
  os: OS;
  product: Product;
  metadata: HistoryMetadata;
  created_at: string;
}

export interface HistoryResponseProps {
  data: HistoryItemProps[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
