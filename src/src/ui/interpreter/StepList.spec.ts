import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { explainFormula } from '@/core/interpreter';
import StepList from './StepList';

const PATH =
  'C:/Users/Example/Documents/Reports/2026/November/very-long-file-name-that-keeps-going/data.csv';

describe('StepList 长文本', () => {
  it('超长路径原样保留，并带断行规则避免撑破卡片', () => {
    const result = explainFormula(`=IF(A1="${PATH}",1,0)`, new Map());
    const html = renderToStaticMarkup(createElement(StepList, { steps: result.steps }));

    expect(JSON.stringify(result.steps)).toContain(PATH);
    expect(html).toContain('[overflow-wrap:anywhere]');
    // 显示层中间省略，完整值放 title
    expect(html).toContain('…');
    // 完整值在 title 里（字符串字面量会带引号，HTML 转义为 &quot;）
    expect(html).toContain('title="&quot;C:/Users/Example');
    expect(html).toContain('very-long-file-name-that-keeps-going/data.csv');
  });

  it('步骤标题过长时也不会把卡片顶开', () => {
    const base = explainFormula('=IF(A1=1,2,3)', new Map()).steps[0];
    const html = renderToStaticMarkup(
      createElement(StepList, { steps: [{ ...base, title: 'X'.repeat(80) }] }),
    );

    expect(html).toContain('break-words');
  });

  it('参数名按内容自适应宽度，超长名称到上限后才换行', () => {
    const base = explainFormula('=IF(A1=1,2,3)', new Map()).steps[0];
    const html = renderToStaticMarkup(
      createElement(StepList, {
        steps: [
          {
            ...base,
            rows: [
              { k: '条件区域1', v: 'Sheet1!$C:$C' },
              { k: '特别特别长的条件区域名称', v: 'Sheet1!$D:$D' },
            ],
          },
        ],
      }),
    );

    expect(html).toContain('条件区域1');
    expect(html).toContain('特别特别长的条件区域名称');
    expect(html).toContain('fit-content(10rem)');
    expect(html).not.toContain('w-16');
    expect(html).toContain('[overflow-wrap:anywhere]');
  });
});
