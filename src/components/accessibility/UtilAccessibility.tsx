import { h } from "preact";
import { useGlobal } from "../../context/GlobalContext";
import { useEffect, useState } from "preact/hooks";

// main.ts에서 보내는 ACCESSIBILITY_CHECK_RESULTS 메시지의 data 구조에 맞게 업데이트
interface ColorInfo {
  r: number;
  g: number;
  b: number;
}

interface AccessibilityCheckResult {
  nodeId: string;
  nodeName: string;
  type: string; // "Border vs Background", "Text vs Background", "Icon vs Background"
  colors: { foreground: ColorInfo; background: ColorInfo };
  contrastRatio: number;
  compliance: { AA: boolean; AAA: boolean };
  status: string; // "Pass" or "Fail"
  isLargeText?: boolean; // 텍스트 대비 검사 시에만 존재
}

interface AccessibilityData {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  results: AccessibilityCheckResult[]; // 재귀 검사 결과 배열
  hasValidSelection: boolean;
}

export default function UtilAccessibility() {
  const { mode } = useGlobal(); // mode는 현재 사용되지 않지만, 필요 시 활용 가능
  const [accessibilityData, setAccessibilityData] =
    useState<AccessibilityData | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      // ACCESSIBILITY_CHECK_RESULTS 메시지 타입으로 변경
      if (message?.type === "ACCESSIBILITY_CHECK_RESULTS") {
        setAccessibilityData(message.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // calculateContrastRatio, getLuminance는 helper.ts로 이동했으므로 여기서는 제거
  // 그러나 UI에서 직접 계산해야 한다면 여기에 유지할 수 있습니다.
  // 현재는 main.ts에서 이미 계산된 결과를 받으므로 필요하지 않습니다.

  if (!accessibilityData?.hasValidSelection) {
    return (
      <div className="p-4 text-center text-gray-500">
        접근성 검사를 위해 요소를 선택해주세요.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">접근성 검사</h3>
    </div>
  );
}
