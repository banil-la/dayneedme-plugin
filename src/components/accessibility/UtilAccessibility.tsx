import { h } from "preact";
import { useGlobal } from "../../context/GlobalContext";
import { useEffect, useState } from "preact/hooks";
interface ColorInfo {
  r: number;
  g: number;
  b: number;
}
interface AccessibilityData {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  foregroundColor: ColorInfo | null;
  backgroundColor: ColorInfo | null;
  hasValidSelection: boolean;
}
export default function UtilAccessibility() {
  const { mode } = useGlobal();
  const [accessibilityData, setAccessibilityData] =
    useState<AccessibilityData | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message?.type === "ACCESSIBILITY_SELECTION_CHANGED") {
        setAccessibilityData(message.data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const calculateContrastRatio = (color1: ColorInfo, color2: ColorInfo) => {
    // 색상을 상대 휘도로 변환
    const getLuminance = (color: ColorInfo) => {
      const { r, g, b } = color;
      const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  };

  const getContrastResult = () => {
    if (
      !accessibilityData?.foregroundColor ||
      !accessibilityData?.backgroundColor
    ) {
      return null;
    }

    const ratio = calculateContrastRatio(
      accessibilityData.foregroundColor,
      accessibilityData.backgroundColor
    );

    return {
      ratio: ratio.toFixed(2),
      passes: ratio >= 4.5, // WCAG AA 기준
      level: ratio >= 4.5 ? "AA" : ratio >= 3 ? "A" : "Fail",
    };
  };

  if (!accessibilityData?.hasValidSelection) {
    return (
      <div className="p-4 text-center text-gray-500">
        접근성 검사를 위해 텍스트나 색상이 있는 요소를 선택해주세요.
      </div>
    );
  }

  const contrastResult = getContrastResult();

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">접근성 검사</h3>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">선택된 요소</h4>
          <p className="text-sm text-gray-600">{accessibilityData.nodeName}</p>
        </div>

        {accessibilityData.foregroundColor && (
          <div>
            <h4 className="font-medium mb-2">전경색</h4>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border"
                style={{
                  backgroundColor: `rgb(${accessibilityData.foregroundColor.r}, ${accessibilityData.foregroundColor.g}, ${accessibilityData.foregroundColor.b})`,
                }}
              />
              <span className="text-sm">
                RGB({accessibilityData.foregroundColor.r},{" "}
                {accessibilityData.foregroundColor.g},{" "}
                {accessibilityData.foregroundColor.b})
              </span>
            </div>
          </div>
        )}

        {accessibilityData.backgroundColor && (
          <div>
            <h4 className="font-medium mb-2">배경색</h4>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border"
                style={{
                  backgroundColor: `rgb(${accessibilityData.backgroundColor.r}, ${accessibilityData.backgroundColor.g}, ${accessibilityData.backgroundColor.b})`,
                }}
              />
              <span className="text-sm">
                RGB({accessibilityData.backgroundColor.r},{" "}
                {accessibilityData.backgroundColor.g},{" "}
                {accessibilityData.backgroundColor.b})
              </span>
            </div>
          </div>
        )}

        {contrastResult && (
          <div>
            <h4 className="font-medium mb-2">대비율</h4>
            <div
              className={`p-3 rounded ${
                contrastResult.passes
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <p className="font-semibold">대비율: {contrastResult.ratio}:1</p>
              <p className="text-sm">WCAG {contrastResult.level} 기준</p>
              <p className="text-sm">
                {contrastResult.passes ? "✅ 통과" : "❌ 미달"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
