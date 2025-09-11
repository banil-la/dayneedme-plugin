import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";

interface EditableTextProps {
  value: string;
  editingNodeId: string | null;
  nodeId: string;
  editingName: string;
  onStartEditing: (nodeId: string, currentValue: string) => void;
  onSaveChange: (nodeId: string) => void;
  onCancelEditing: () => void;
  onSetEditingName: (name: string) => void;
  onHandleKeyDown: (e: KeyboardEvent, nodeId: string) => void;
  placeholder?: string;
  className?: string;
  editingClassName?: string;
  displayClassName?: string;
  title?: string;
}

export default function EditableText({
  value,
  editingNodeId,
  nodeId,
  editingName,
  onStartEditing,
  onSaveChange,
  onCancelEditing,
  onSetEditingName,
  onHandleKeyDown,
  placeholder = "입력...",
  className = "",
  editingClassName = "px-1.5 py-0.5 border border-blue-500 rounded text-xs font-bold outline-none",
  displayClassName = "cursor-pointer hover:bg-blue-50 transition-colors",
  title = "클릭하여 편집",
}: EditableTextProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 편집 모드일 때 전체 텍스트 선택
  useEffect(() => {
    if (editingNodeId === nodeId && inputRef.current) {
      inputRef.current.select();
    }
  }, [editingNodeId, nodeId]);

  const isEditing = editingNodeId === nodeId;

  return (
    <div className={className}>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editingName}
          onChange={(e) =>
            onSetEditingName((e.target as HTMLInputElement).value)
          }
          onKeyDown={(e) => onHandleKeyDown(e, nodeId)}
          onBlur={() => onCancelEditing()}
          autoFocus
          className={editingClassName}
          placeholder={placeholder}
        />
      ) : (
        <div
          className={displayClassName}
          onClick={() => {
            console.log("[EditableText] Clicked to start editing:", {
              nodeId,
              value,
            });
            onStartEditing(nodeId, value);
          }}
          title={title}
        >
          {value}
        </div>
      )}
    </div>
  );
}
