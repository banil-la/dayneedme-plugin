import { h } from "preact";

interface ComponentInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  width: number;
  height: number;
  x: number;
  y: number;
  visible: boolean;
  locked: boolean;
}

interface ComponentInfoProps {
  component: ComponentInfo;
  analyzing: boolean;
}

export default function ComponentInfoDisplay({
  component,
  analyzing,
}: ComponentInfoProps) {
  return (
    <div className="mb-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
        <h4 className="m-0 mb-2 text-gray-800 font-semibold">
          {component.name}
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            크기: {Math.round(component.width)} × {Math.round(component.height)}
          </div>
          <div>
            위치: ({Math.round(component.x)}, {Math.round(component.y)})
          </div>
          <div>타입: {component.type}</div>
          <div>가시성: {component.visible ? "보임" : "숨김"}</div>
          <div>잠금: {component.locked ? "잠김" : "해제"}</div>
          {component.description && (
            <div className="mt-2 italic">설명: {component.description}</div>
          )}
        </div>
        {analyzing && (
          <div className="mt-3 px-4 py-2 bg-green-600 text-white rounded text-xs text-center">
            구조 분석 중...
          </div>
        )}
      </div>
    </div>
  );
}
