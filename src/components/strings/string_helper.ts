export interface StringData {
  code: string;
  id: number;
  content: string;
}

export interface ParsedContent {
  code: string;
  kr: string;
  en: string;
}

export interface SearchResult {
  exact_matched: StringData[];
  partial_matched: StringData[];
}

export const parseContent = (content: string): ParsedContent => {
  try {
    const parsed = JSON.parse(content);
    return {
      code: parsed.code || "",
      kr: parsed.kr || "",
      en: parsed.en || "",
    };
  } catch (e) {
    // console.error("Failed to parse content:", e);
    return { code: "", kr: content, en: "" };
  }
};
