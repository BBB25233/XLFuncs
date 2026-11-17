import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import InterpreterPage from './InterpreterPage';

/**
 * 页面级冒烟：不依赖浏览器环境，用服务端渲染验证组件树能正常出首屏。
 * useEffect 不会执行，因此这里只断言「标题 / 输入区 / 示例按钮」存在；
 * 加载条目并生成结果的链路由 ui/interpreter/loadEntries.spec.ts 覆盖。
 */
describe('InterpreterPage 首屏', () => {
  it('能渲染标题、输入框与示例按钮', () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(InterpreterPage)),
    );

    expect(html).toContain('公式解释器');
    expect(html).toContain('<textarea');
    expect(html).toContain('查价 × 数量 + 合计');
    expect(html).toContain('不代为计算结果');
  });
});
