import { h } from "preact";
import NodeStructure from "./NodeStructure";

interface ComponentAnalysis {
  component: any;
  structure: any;
  totalNodes: number;
  nodeTypes: Record<string, number>;
}

interface AnalysisResultProps {
  analysis: ComponentAnalysis;
  expandedNodes: Set<string>;
  editingNodeId: string | null;
  editingName: string;
  onToggleNode: (nodeId: string) => void;
  onStartEditing: (nodeId: string, currentName: string) => void;
  onSaveNameChange: (nodeId: string) => void;
  onCancelEditing: () => void;
  onSetEditingName: (name: string) => void;
  onHandleKeyDown: (e: KeyboardEvent, nodeId: string) => void;
}

export default function AnalysisResult({
  analysis,
  expandedNodes,
  editingNodeId,
  editingName,
  onToggleNode,
  onStartEditing,
  onSaveNameChange,
  onCancelEditing,
  onSetEditingName,
  onHandleKeyDown,
}: AnalysisResultProps) {
  return (
    <div className="mt-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
        <div className="text-xs text-gray-600 mb-3">
          총 노드: {analysis.totalNodes}개
        </div>

        <div className="mb-3">
          <strong className="text-sm font-semibold">노드 타입 통계:</strong>
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(analysis.nodeTypes).map(([type, count]) => (
              <span
                key={type}
                className="px-2 py-1 bg-gray-200 rounded-full text-xs"
              >
                {type}: {count}
              </span>
            ))}
          </div>
        </div>

        <div>
          <strong className="text-sm font-semibold">구조:</strong>
          <div className="mt-2 max-h-72 overflow-auto">
            <NodeStructure
              node={analysis.structure}
              depth={0}
              isRoot={true}
              expandedNodes={expandedNodes}
              editingNodeId={editingNodeId}
              editingName={editingName}
              onToggleNode={onToggleNode}
              onStartEditing={onStartEditing}
              onSaveNameChange={onSaveNameChange}
              onCancelEditing={onCancelEditing}
              onSetEditingName={onSetEditingName}
              onHandleKeyDown={onHandleKeyDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
