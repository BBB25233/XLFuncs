import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ExplainStep } from '@/core/interpreter';
import { layoutDiagram } from '@/core/interpreter';
import DiagramView from './DiagramView';

function makeStep(n: number): ExplainStep {
  return {
    n,
    kind: 'call',
    title: `步骤${n}`,
    rows: [{ k: '查什么', v: `A${n}` }],
    output: `产出${n}`,
    failure: [],
    warnings: [],
    detail: [],
    inputs: [],
    short: `动作${n}`,
    range: [n * 10, n * 10 + 5],
  };
}

function render(steps: ExplainStep[], structure?: Parameters<typeof layoutDiagram>[1]): string {
  return renderToStaticMarkup(
    createElement(DiagramView, { layout: layoutDiagram(steps, structure) }),
  );
}

describe('DiagramView 渲染', () => {
  it('单主干模式渲染每个步骤一个编号', () => {
    const html = render([makeStep(1), makeStep(2), makeStep(3)]);
    expect(html).toContain('共 3 步');
    expect((html.match(/<circle/g) ?? []).length).toBe(3);
  });

  it('分支模式渲染左右两支与汇合节点', () => {
    const steps = [makeStep(1), makeStep(2), makeStep(3), makeStep(4), makeStep(5)];
    const html = render(steps, { branch: { left: [1, 2], right: [3, 4], merge: 5 } });

    expect(html).toContain('左右两支各自计算');
    expect(html).toContain('汇合');
    expect((html.match(/<circle/g) ?? []).length).toBe(5);
    expect((html.match(/marker-end/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it('多支模式渲染支路标签，而不是拆成多列', () => {
    const steps = [1, 2, 3, 4, 5, 6].map((n, index) => ({
      ...makeStep(n),
      groupLabel: index < 2 ? 'A' : index < 4 ? 'B' : index === 4 ? 'C' : '汇合',
    }));
    const html = render(steps, {
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

    expect(html).toContain('分 3 支');
    expect(html).toContain('支A');
    expect(html).toContain('支B');
    expect(html).toContain('支C');
    expect((html.match(/<circle/g) ?? []).length).toBe(6);
  });
});
