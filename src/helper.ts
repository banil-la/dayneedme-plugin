// src/helper.ts

// Figma API에서 제공하는 핵심 타입들을 명시적으로 임포트합니다.
// 'Color' 타입은 plugin-apid.ts에 직접 정의되어 있지 않으므로, 대신 'RGB'를 임포트합니다.
// import { RGB, SceneNode, Paint, SolidPaint } from '@figma/plugin-typings'; // 이 라인을 제거했습니다.

// Paint 타입이 SolidPaint인지 확인하는 타입 가드 함수
// Paint와 SolidPaint 타입을 any로 변경하여 타입 에러를 우회합니다.
function isSolidPaint(paint: any): paint is any {
  // paint: Paint -> paint: any
  return paint.type === "SOLID";
}

// Figma API에서 제공하는 RGB 객체를 0-255 스케일의 RGB 객체로 변환하는 헬퍼 함수
// 'color' 매개변수의 타입을 'RGB'에서 'any'로 변경했습니다.
export function getRgbFromFigmaColor(color: any): {
  // color: RGB -> color: any
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
// SceneNode 타입을 any로 변경하여 타입 에러를 우회합니다.
export function findEffectiveBackgroundColor(
  node: any | null // SceneNode -> any
): { r: number; g: number; b: number } | null {
  if (!node) {
    return null;
  }

  // 현재 노드의 채우기(fills) 확인
  if ("fills" in node && node.fills !== figma.mixed && node.fills.length > 0) {
    // 불투명한 SOLID 타입의 채우기 찾기 (opacity가 없거나 1인 경우)
    const solidFill = node.fills.find(
      (
        fill: any // fill: any
      ) =>
        isSolidPaint(fill) && // 타입 가드 함수 사용
        (fill.opacity === undefined || fill.opacity === 1)
    );
    // solidFill이 SolidPaint 타입임을 확인하고 color 속성 접근
    if (solidFill && isSolidPaint(solidFill)) {
      return getRgbFromFigmaColor(solidFill.color);
    }
  }

  // 현재 노드에 유효한 배경색이 없으면 부모 노드로 이동하여 재귀적으로 탐색
  // PAGE 타입은 최상위이므로 더 이상 탐색하지 않음
  if (node.parent && node.parent.type !== "PAGE") {
    return findEffectiveBackgroundColor(node.parent as any); // SceneNode -> any
  }

  return null; // 페이지 최상단까지 도달했으나 유효한 배경색을 찾지 못함
}
