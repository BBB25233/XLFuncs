import { describe, expect, it } from 'vitest';
import { layoutDiagram, truncate } from './layout';
import type { ExplainStep } from './model';

function makeStep(n: number, rowCount: number): ExplainStep {
  return {
    n,
    kind: 'call',
    title: `函数${n} · 动作`,
    rows: Array.from({ length: rowCount }, (_, index) => ({ k: `标签${index}`, v: `内容${index}` })),
    output: `产出${n}`,
    failure: [],
    warnings: [],
    detail: [],
    inputs: [],
    short: `动作${n}`,
    range: [n * 10, n * 10 + 5],
  };
}

describe('layoutDiagram', () => {
  it('默认单主干：每步一张卡片，纵向依次排布', () => {
    const layout = layoutDiagram([makeStep(1, 4), makeStep(2, 3), makeStep(3, 5)]);
    expect(layout.mode).toBe('linear');
    expect(layout.cards).toHaveLength(3);
    expect(layout.cards[0].y).toBeLessThan(layout.cards[1].y);
    expect(layout.cards[1].y).toBeLessThan(layout.cards[2].y);
    expect(layout.height).toBeGreaterThan(layout.cards[2].y + layout.cards[2].height);
    expect(layout.cards[0].x + layout.cards[0].width).toBeLessThanOrEqual(layout.width);
  });

  it('行数超过上限时截断，避免卡片无限增高', () => {
    const layout = layoutDiagram([makeStep(1, 9)]);
    expect(layout.cards[0].rows).toHaveLength(6);
  });

  it('空步骤时给出最小高度', () => {
    const layout = layoutDiagram([]);
    expect(layout.cards).toHaveLength(0);
    expect(layout.height).toBeGreaterThanOrEqual(160);
  });

  it('满足条件时切换为左右分列并汇合', () => {
    const steps = [makeStep(1, 3), makeStep(2, 4), makeStep(3, 3), makeStep(4, 2), makeStep(5, 3)];
    const layout = layoutDiagram(steps, {
      branch: { left: [1, 2], right: [3, 4], merge: 5 },
    });

    expect(layout.mode).toBe('branch');
    expect(layout.branches).toHaveLength(2);
    expect(layout.branches[0].cards.map((card) => card.n)).toEqual([1, 2]);
    expect(layout.branches[1].cards.map((card) => card.n)).toEqual([3, 4]);
    expect(layout.mergeCard?.n).toBe(5);
    expect(layout.mergeCard?.y).toBeGreaterThan(layout.branches[0].cards[1].y);
    expect(layout.mergeCard?.y).toBeGreaterThan(layout.branches[1].cards[1].y);
    expect(layout.height).toBeGreaterThan((layout.mergeCard?.y ?? 0) + (layout.mergeCard?.height ?? 0));
  });

  it('两支卡片互不重叠', () => {
    const steps = [makeStep(1, 2), makeStep(2, 2), makeStep(3, 2), makeStep(4, 2), makeStep(5, 2)];
    const layout = layoutDiagram(steps, {
      branch: { left: [1, 2], right: [3, 4], merge: 5 },
    });

    const leftRight = layout.branches[0].x + layout.branches[0].width;
    expect(leftRight).toBeLessThanOrEqual(layout.branches[1].x);
  });

  it('分支步骤编号缺失时回退单主干', () => {
    const steps = [makeStep(1, 2), makeStep(2, 2)];
    const layout = layoutDiagram(steps, {
      branch: { left: [1], right: [99], merge: 2 },
    });
    expect(layout.mode).toBe('linear');
    expect(layout.cards).toHaveLength(2);
  });

  it('三支及以上走单主干并保留支路标签', () => {
    const steps = [
      { ...makeStep(1, 2), groupLabel: 'A' },
      { ...makeStep(2, 2), groupLabel: 'A' },
      { ...makeStep(3, 2), groupLabel: 'B' },
      { ...makeStep(4, 2), groupLabel: 'B' },
      { ...makeStep(5, 2), groupLabel: 'C' },
      { ...makeStep(6, 2), groupLabel: '汇合' },
    ];
    const layout = layoutDiagram(steps, {
      groups: {
        groups: [
          { label: 'A', numbers: [1, 2] },
          { label: 'B', numbers: [3, 4] },
          { label: 'C', numbers: [5] },
        ],
        merges: [6],
        merge: 6,
      },
    });

    expect(layout.mode).toBe('grouped');
    expect(layout.cards).toHaveLength(6);
    expect(layout.cards.map((card) => card.group)).toEqual(['A', 'A', 'B', 'B', 'C', '汇合']);
    expect(layout.cards[0].y).toBeLessThan(layout.cards[5].y);
    expect(layout.branches).toHaveLength(0);
    expect(layout.mergeCard).toBeNull();
  });

  it('truncate 超长文本会加省略号', () => {
    expect(truncate('一二三四五', 3)).toBe('一二…');
    expect(truncate('一二', 3)).toBe('一二');
  });
});
