import { h } from "preact";
import { LuType } from "react-icons/lu";
import EditableText from "./EditableText";

interface TextLayer {
  id: string;
  name: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

interface TextLayersViewProps {
  textLayers: TextLayer[];
  editingNodeId: string | null;
  editingName: string;
  onStartTextEditing: (nodeId: string, currentText: string) => void;
  onSaveTextChange: (nodeId: string) => void;
  onStartEditing: (nodeId: string, currentName: string) => void;
  onSaveNameChange: (nodeId: string) => void;
  onCancelEditing: () => void;
  onSetEditingName: (name: string) => void;
  onHandleKeyDown: (e: KeyboardEvent, nodeId: string) => void;
  onHandleTextKeyDown: (e: KeyboardEvent, nodeId: string) => void;
}

export default function TextLayersView({
  textLayers,
  editingNodeId,
  editingName,
  onStartTextEditing,
  onSaveTextChange,
  onStartEditing,
  onSaveNameChange,
  onCancelEditing,
  onSetEditingName,
  onHandleKeyDown,
  onHandleTextKeyDown,
}: TextLayersViewProps) {
  // 텍스트 레이어들을 Y 좌표 기준으로 정렬 (위에서 아래로)
  const sortedLayers = [...textLayers].sort((a, b) => a.y - b.y);

  return (
    <div className="space-y-2">
      {sortedLayers.map((layer) => (
        <div
          key={layer.id}
          className={`p-2 border rounded text-xs ${
            layer.visible
              ? "border-gray-300 bg-white"
              : "border-gray-200 bg-gray-100 opacity-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <LuType className="w-3 h-3 text-blue-600" />
            <EditableText
              value={layer.name}
              editingNodeId={editingNodeId}
              nodeId={layer.id}
              editingName={editingName}
              onStartEditing={onStartEditing}
              onSaveChange={onSaveNameChange}
              onCancelEditing={onCancelEditing}
              onSetEditingName={onSetEditingName}
              onHandleKeyDown={onHandleKeyDown}
              placeholder="레이어 이름"
              className="flex-1"
              editingClassName="px-1.5 py-0.5 border border-blue-500 rounded text-xs font-bold outline-none"
              displayClassName="text-gray-500 text-xs cursor-pointer hover:text-gray-700 transition-colors"
              title="클릭하여 이름 변경"
            />
          </div>

          <EditableText
            value={layer.text}
            editingNodeId={editingNodeId}
            nodeId={`${layer.id}_text`}
            editingName={editingName}
            onStartEditing={(nodeId, currentText) =>
              onStartTextEditing(layer.id, currentText)
            }
            onSaveChange={(nodeId) => onSaveTextChange(layer.id)}
            onCancelEditing={onCancelEditing}
            onSetEditingName={onSetEditingName}
            onHandleKeyDown={(e, nodeId) => onHandleTextKeyDown(e, layer.id)}
            placeholder="텍스트 입력..."
            className="w-full"
            editingClassName="px-1.5 py-0.5 border border-green-500 rounded text-xs font-bold outline-none w-full"
            displayClassName="text-blue-600 text-xs cursor-pointer px-1 py-0.5 rounded transition-colors hover:bg-blue-50"
            title="클릭하여 텍스트 변경"
          />
        </div>
      ))}
    </div>
  );
}
