import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDiagnostic } from '@/core/interpreter';
import FormulaInput from './FormulaInput';

const noop = (): void => {
  /* 静态渲染不需要行为 */
};

describe('FormulaInput', () => {
  it('没有诊断时显示说明文案，不出现修复按钮', () => {
    const html = renderToStaticMarkup(
      createElement(FormulaInput, {
        value: '=SUM(A1:A3)',
        diagnostics: [],
        onChange: noop,
        onFix: noop,
      }),
    );

    expect(html).toContain('不代为计算结果');
    expect(html).not.toContain('补上');
  });

  it('有诊断时渲染位置文案、修复按钮与波浪线', () => {
    const html = renderToStaticMarkup(
      createElement(FormulaInput, {
        value: '=SUM(A1:A3',
        diagnostics: [
          createDiagnostic('E201', {
            start: 9,
            message: '缺少右括号',
            fix: { label: '补上 )', start: 10, end: 10, text: ')' },
          }),
        ],
        onChange: noop,
        onFix: noop,
      }),
    );

    expect(html).toContain('第 10 个字符：缺少右括号');
    expect(html).toContain('E201');
    expect(html).toContain('补上 )');
    expect(html).toContain('wavy');
    // 透明层必须靠内联样式：Tailwind 调色板里没有 transparent token
    expect(html).toContain('color:transparent');
    expect(html).toContain('background-color:transparent');
  });

  it('警告级诊断使用独立的颜色标记', () => {
    const html = renderToStaticMarkup(
      createElement(FormulaInput, {
        value: '=VLOOKUP(A1,B1:C9,2)',
        diagnostics: [createDiagnostic('W401', { start: 1 })],
        onChange: noop,
        onFix: noop,
      }),
    );

    expect(html).toContain('#B45309');
  });
});
