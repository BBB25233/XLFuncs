import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildTree, explainFormula, layoutTree } from '@/core/interpreter';
import TreeCanvas from './TreeCanvas';

const noop = (): void => {
  /* 静态渲染不需要行为 */
};

function render(): string {
  const result = explainFormula('=SUM(A1:A3)+1', new Map());
  const layout = layoutTree(buildTree(result.ast, result.steps));
  return renderToStaticMarkup(
    createElement(TreeCanvas, {
      layout,
      onClose: noop,
      onSelectStep: noop,
      onToggle: noop,
    }),
  );
}

describe('TreeCanvas', () => {
  it('渲染全屏对话框与画布操作按钮', () => {
    const html = render();
    expect(html).toContain('role="dialog"');
    expect(html).toContain('公式结构');
    expect(html).toContain('适应屏幕');
    expect(html).toContain('关闭');
    expect(html).toContain('双指缩放');
  });

  it('初始不显示缩放比例之外的调试信息，画布占满剩余空间', () => {
    const html = render();
    expect(html).toContain('flex-1');
    expect(html).toContain('touch-action:none');
  });
});
