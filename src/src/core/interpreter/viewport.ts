/** 全屏画布的缩放/平移数学：纯函数，便于单测，不碰 DOM。 */

export const ZOOM = {
  /** 最小缩放：允许把大树缩到一屏内 */
  min: 0.08,
  max: 3,
  /** 低于该比例隐藏文字，只保留形状 */
  textThreshold: 0.5,
  /** 适应屏幕时留白系数 */
  fitRatio: 0.95,
  /** 双击放大的目标比例 */
  doubleTap: 2,
} as const;

export interface Point {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clampScale(scale: number): number {
  return Math.min(ZOOM.max, Math.max(ZOOM.min, scale));
}

/** 适配屏幕：取宽高三者中更小的比例，再留 5% 边距 */
export function fitScale(
  contentWidth: number,
  contentHeight: number,
  viewWidth: number,
  viewHeight: number,
): number {
  if (contentWidth <= 0 || contentHeight <= 0 || viewWidth <= 0 || viewHeight <= 0) {
    return 1;
  }
  const ratio = Math.min(viewWidth / contentWidth, viewHeight / contentHeight);
  return clampScale(ratio * ZOOM.fitRatio);
}

/** 由「中心点 + 缩放」推出 SVG 的 viewBox（单位与内容坐标一致） */
export function viewBoxFor(center: Point, scale: number, viewWidth: number, viewHeight: number): ViewBox {
  const width = viewWidth / scale;
  const height = viewHeight / scale;
  return { x: center.x - width / 2, y: center.y - height / 2, width, height };
}

/** 以屏幕上的某个锚点缩放：该点下方的内容保持不动 */
export function zoomAt(
  center: Point,
  scale: number,
  nextScale: number,
  anchor: Point,
  viewWidth: number,
  viewHeight: number,
): { center: Point; scale: number } {
  const target = clampScale(nextScale);
  const contentX = center.x + (anchor.x - viewWidth / 2) / scale;
  const contentY = center.y + (anchor.y - viewHeight / 2) / scale;

  return {
    scale: target,
    center: {
      x: contentX - (anchor.x - viewWidth / 2) / target,
      y: contentY - (anchor.y - viewHeight / 2) / target,
    },
  };
}

/** 拖动：屏幕位移换算成内容位移，并把中心限制在内容范围内（允许少量越界） */
export function panCenter(
  center: Point,
  delta: Point,
  scale: number,
  contentWidth: number,
  contentHeight: number,
): Point {
  const marginX = contentWidth * 0.15;
  const marginY = contentHeight * 0.15;
  return {
    x: Math.min(contentWidth + marginX, Math.max(-marginX, center.x - delta.x / scale)),
    y: Math.min(contentHeight + marginY, Math.max(-marginY, center.y - delta.y / scale)),
  };
}
