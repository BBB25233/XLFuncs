import { describe, expect, it } from 'vitest';
import { collectFunctionNames, explainFormula, parseFormula } from '@/core/interpreter';
import { loadEntries } from './loadEntries';

const SAMPLE = '=IFERROR(VLOOKUP(A2,D:F,3,0)*C2+SUM(B2:B10),"未找到")';

describe('loadEntries', () => {
  it('只为公式里出现的函数按需加载条目', async () => {
    const ast = parseFormula(SAMPLE);
    const names = collectFunctionNames(ast);
    const entries = await loadEntries(names);

    expect(Array.from(entries.keys()).sort()).toEqual(['IFERROR', 'SUM', 'VLOOKUP']);
    expect(entries.get('VLOOKUP')?.id).toBe('vlookup');
    expect(entries.get('SUM')?.id).toBe('sum');
  });

  it('加载后可直接生成解释，且能跳转函数详情', async () => {
    const ast = parseFormula(SAMPLE);
    const entries = await loadEntries(collectFunctionNames(ast));
    const result = explainFormula(SAMPLE, entries);

    expect(result.steps).toHaveLength(5);
    expect(result.steps[0].fnId).toBe('vlookup');
    expect(result.steps[0].title).toContain('VLOOKUP');
    expect(result.steps[4].fnId).toBe('iferror');
  });

  it('未收录的函数名不会让加载失败', async () => {
    const entries = await loadEntries(['FOOBAR']);
    expect(entries.size).toBe(0);
  });
});
