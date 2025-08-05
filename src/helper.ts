// src/helper.ts

// Figma API에서 제공하는 Color 객체를 0-255 스케일의 RGB 객체로 변환하는 헬퍼 함수
export function getRgbFromFigmaColor(color: {
  r: number;
  g: number;
  b: number;
}): {
  r: number;
  g: number;
  b: number;
} {
  return {
    r: Math.round(color.r * 255),
    g: Math.round(color.g * 255),
    b: Math.round(color.b * 255),
  };
}

/**
 * 주어진 노드의 유효한 배경색을 찾기 위해 부모 노드를 재귀적으로 탐색합니다.
 * 가장 먼저 발견되는 불투명한 SOLID 타입의 채우기 색상을 배경색으로 간주합니다.
 * @param node 현재 검사 중인 노드
 * @returns { r: number; g: number; b: number } 형태의 배경색 객체 또는 null
 */
export function findEffectiveBackgroundColor(
  node: any
): { r: number; g: number; b: number } | null {
  if (!node) {
    return null;
  }

  // 현재 노드의 채우기(fills) 확인
  if ("fills" in node && node.fills !== figma.mixed && node.fills.length > 0) {
    // 불투명한 SOLID 타입의 채우기 찾기 (opacity가 없거나 1인 경우)
    const solidFill = node.fills.find(
      (fill: any) =>
        fill.type === "SOLID" &&
        (fill.opacity === undefined || fill.opacity === 1)
    );
    // solidFill이 존재하고, SolidPaint 타입인지 확인하는 타입 가드 추가
    if (solidFill && solidFill.type === "SOLID") {
      return getRgbFromFigmaColor(solidFill.color);
    }
  }

  // 현재 노드에 유효한 배경색이 없으면 부모 노드로 이동하여 재귀적으로 탐색
  // PAGE 타입은 최상위이므로 더 이상 탐색하지 않음
  if (node.parent && node.parent.type !== "PAGE") {
    return findEffectiveBackgroundColor(node.parent);
  }

  return null; // 페이지 최상단까지 도달했으나 유효한 배경색을 찾지 못함
}
