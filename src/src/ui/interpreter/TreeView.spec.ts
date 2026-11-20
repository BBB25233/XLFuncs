import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildTree, explainFormula, layoutTree } from '@/core/interpreter';
import TreeView from './TreeView';

const noop = (): void => {
  /* 静态渲染不需要行为 */
};

function render(activeStep?: number): string {
  const result = explainFormula('=SUM(A1:A3)+1', new Map());
  const layout = layoutTree(buildTree(result.ast, result.steps));
  return renderToStaticMarkup(createElement(TreeView, { layout, activeStep, onSelectStep: noop }));
}

describe('TreeView', () => {
  it('渲染函数名、引用与运算符节点', () => {
    const html = render();
    expect(html).toContain('SUM');
    expect(html).toContain('A1:A3');
    expect(html).toContain('>+<');
  });

  it('每个节点一个主矩形，连线数等于节点数减一', () => {
    const result = explainFormula('=SUM(A1:A3)+1', new Map());
    const layout = layoutTree(buildTree(result.ast, result.steps));
    const html = render();

    const rects = (html.match(/<rect /g) ?? []).length;
    const functions = layout.boxes.filter((box) => box.variant === 'function');
    const withChildren = functions.filter((box) => box.collapsible).length;
    expect(rects).toBe(functions.length * 2 + withChildren); // 卡片 + 色条 + 折叠按钮
    const paths = (html.match(/<path /g) ?? []).length;
    expect(paths).toBe(layout.edges.length + 1); // 多了 defs 里的箭头
  });

  it('高亮当前步骤对应的节点', () => {
    expect(render(1)).toContain('stroke="#2563EB"');
    expect(render()).not.toContain('stroke="#2563EB"');
  });
});

describe('TreeView 折叠', () => {
  it('大子树折叠后显示隐藏数量', () => {
    const result = explainFormula(
      '=IFERROR(VLOOKUP(A2,D2:F9,3,0)*C2+SUM(B2:B10),"未找到")',
      new Map(),
    );
    const tree = buildTree(result.ast, result.steps);
    const layout = layoutTree(tree, { collapsed: new Set(['root.0.0.0']) });
    const html = renderToStaticMarkup(
      createElement(TreeView, { layout, onToggle: noop, onSelectStep: noop }),
    );

    expect(html).toMatch(/\+\d+<\/text>/);
  });

  it('小子树不显示折叠按钮，避免噪声', () => {
    const result = explainFormula('=SUM(A1:A3)+1', new Map());
    const tree = buildTree(result.ast, result.steps);
    const layout = layoutTree(tree);
    const sum = layout.boxes.find((box) => box.id === 'root.0');
    expect(sum?.collapsible).toBe(false);
  });
});

describe('TreeView 长文本', () => {
  it('叶子折行渲染，并把完整值放进 title', () => {
    const formula = `=IF(A1="${'C:/Users/Example/Documents/Reports/'.repeat(3)}data.csv",1,0)`;
    const result = explainFormula(formula, new Map());
    const layout = layoutTree(buildTree(result.ast, result.steps));
    const html = renderToStaticMarkup(
      createElement(TreeView, { layout, onSelectStep: noop, onToggle: noop }),
    );

    expect(html).toContain('<tspan');
    expect(html).toContain('data.csv');
    expect(html).toContain('<title>');
  });
});

describe('TreeView 隐藏标签', () => {
  it('小比例时只保留形状，不渲染文字', () => {
    const result = explainFormula('=SUM(A1:A3)+1', new Map());
    const layout = layoutTree(buildTree(result.ast, result.steps));
    const html = renderToStaticMarkup(
      createElement(TreeView, { layout, showLabels: false, onSelectStep: noop, onToggle: noop }),
    );

    // 文字仍在 DOM 中（便于读屏），但通过 display:none 隐藏
    expect((html.match(/display="none"/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
