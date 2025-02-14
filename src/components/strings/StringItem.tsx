import { h } from "preact";
import { parseContent, StringData } from "./string_helper";
import { emit } from "@create-figma-plugin/utilities";

const StringItem: React.FC<{ item: StringData; }> = ({
    item,
    // onCopy,
  }) => {
    const parsed = parseContent(item.content);
    
    const handleApply = () => {
      emit("APPLY_STRING_CODE", item.code);
    };
    
    return (
      <li className="bg-base-200 p-3 rounded flex flex-col gap-3 text-xs font-semibold">
        <div className="w-full flex justify-between items-center border-b border-b-base-content border-opacity-10 pb-1">
            <span className="uppercase">{item.code}</span>
            <button 
              onClick={handleApply}
              className="btn btn-xs btn-primary"
            >
              적용
            </button>
        </div>
        <div className="flex flex-col gap-1">
            <p className="flex gap-1">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">KR</span>
              <span>{parsed.kr}</span>
            </p>
            <p className="flex gap-1">
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">EN</span>
              <span>{parsed.en}</span>
            </p>
        </div>
      </li>
    );
  };

export default StringItem;