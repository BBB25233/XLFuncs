import { describe, expect, it } from 'vitest';
import { ZOOM, clampScale, fitScale, panCenter, viewBoxFor, zoomAt } from './viewport';

describe('fitScale', () => {
  it('内容比视口大时按较小比例缩放并留边距', () => {
    expect(fitScale(1000, 500, 500, 500)).toBeCloseTo(0.475, 5);
  });

  it('内容很小时不会超过最大缩放', () => {
    expect(fitScale(100, 100, 1000, 1000)).toBe(ZOOM.max);
  });

  it('超大树不会小于最小缩放', () => {
    expect(fitScale(100000, 1000, 360, 600)).toBe(ZOOM.min);
  });

  it('尺寸非法时退回 1', () => {
    expect(fitScale(0, 100, 360, 600)).toBe(1);
  });
});

describe('viewBoxFor', () => {
  it('视图宽度等于视口除以缩放比', () => {
    const box = viewBoxFor({ x: 400, y: 300 }, 2, 800, 600);
    expect(box).toEqual({ x: 200, y: 150, width: 400, height: 300 });
  });
});

describe('zoomAt', () => {
  it('锚点下的内容保持不动', () => {
    const viewWidth = 800;
    const viewHeight = 600;
    const center = { x: 400, y: 300 };
    const anchor = { x: 600, y: 300 };

    const before = viewBoxFor(center, 1, viewWidth, viewHeight);
    const contentXBefore = before.x + (anchor.x / viewWidth) * before.width;

    const zoomed = zoomAt(center, 1, 2, anchor, viewWidth, viewHeight);
    const after = viewBoxFor(zoomed.center, zoomed.scale, viewWidth, viewHeight);
    const contentXAfter = after.x + (anchor.x / viewWidth) * after.width;

    expect(contentXAfter).toBeCloseTo(contentXBefore, 5);
  });

  it('缩放被限制在范围内', () => {
    const result = zoomAt({ x: 0, y: 0 }, 1, 99, { x: 0, y: 0 }, 800, 600);
    expect(result.scale).toBe(ZOOM.max);
  });
});

describe('panCenter', () => {
  it('拖动方向与内容移动方向一致（手指右移内容右移）', () => {
    const next = panCenter({ x: 100, y: 100 }, { x: 50, y: 0 }, 1, 1000, 1000);
    expect(next.x).toBe(50);
  });

  it('中心被限制在内容范围内（允许 15% 越界手感）', () => {
    const next = panCenter({ x: 10, y: 10 }, { x: 9999, y: 9999 }, 1, 1000, 1000);
    expect(next.x).toBeGreaterThanOrEqual(-150);
    expect(next.x).toBeLessThanOrEqual(1150);
    expect(next.y).toBeGreaterThanOrEqual(-150);
  });

  it('缩放越大，同样拖动位移换算的内容位移越小', () => {
    const one = panCenter({ x: 500, y: 500 }, { x: 40, y: 0 }, 1, 2000, 2000);
    const two = panCenter({ x: 500, y: 500 }, { x: 40, y: 0 }, 2, 2000, 2000);
    expect(500 - (two.x)).toBeLessThan(500 - one.x);
  });
});

describe('clampScale', () => {
  it('低于下限取最小值，高于上限取最大值', () => {
    expect(clampScale(0.001)).toBe(ZOOM.min);
    expect(clampScale(10)).toBe(ZOOM.max);
    expect(clampScale(1.5)).toBe(1.5);
  });
});
