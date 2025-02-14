import { h } from "preact";

interface StringSearchProps {
  onSearch: (text: string) => Promise<void>;
}

export default function StringSearch({ onSearch }: StringSearchProps) {
  return (
    <input 
    className="w-full rounded-md p-2"
      placeholder="궁금한 문자열을 입력해 주세요." 
      onChange={(e) => onSearch((e.target as HTMLInputElement).value)}
    />
  );
}