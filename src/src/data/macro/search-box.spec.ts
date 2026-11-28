import { describe, expect, it } from 'vitest';
import { MACRO_BUNDLE } from './bundle';
import { searchMacros } from './index';

describe('宏内搜索 searchMacros', () => {
  it('空关键词返回空数组', () => {
    expect(searchMacros(MACRO_BUNDLE, '')).toEqual([]);
    expect(searchMacros(MACRO_BUNDLE, '   ')).toEqual([]);
  });

  it('中文任务词能命中配方', () => {
    const hits = searchMacros(MACRO_BUNDLE, '删空行', 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((entry) => entry.id === 'delete-empty-rows')).toBe(true);
  });

  it('错误码能命中错误条目', () => {
    const hits = searchMacros(MACRO_BUNDLE, '1004', 5);
    expect(hits.some((entry) => entry.kind === 'error')).toBe(true);
  });

  it('英文成员名能命中', () => {
    const hits = searchMacros(MACRO_BUNDLE, 'Range.Find', 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.id).toContain('find');
  });

  it('limit 生效且顺序稳定', () => {
    const a = searchMacros(MACRO_BUNDLE, '单元格', 3);
    const b = searchMacros(MACRO_BUNDLE, '单元格', 3);
    expect(a.length).toBeLessThanOrEqual(3);
    expect(a.map((entry) => entry.id)).toEqual(b.map((entry) => entry.id));
  });

  it('无结果返回空数组', () => {
    expect(searchMacros(MACRO_BUNDLE, 'zzzz不存在的词zzzz', 5)).toEqual([]);
  });
});
