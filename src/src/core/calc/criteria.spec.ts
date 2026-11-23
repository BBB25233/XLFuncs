import { describe, expect, it } from 'vitest';
import type { Sheet } from '@/types';
import { parseCriterion } from './criteria';

/** 一个最小的空 Sheet，够 parseCriterion 解析文本条件用 */
const sheet: Sheet = { rows: 10, cols: 5, cells: [] } as unknown as Sheet;

describe('条件解析：公式口径 vs 单元格口径', () => {
  it('公式参数里裸文本仍然报 #NAME?（SUMIF 家族口径不变）', () => {
    const c = parseCriterion('水果', sheet, 'formula');
    expect(c.failure?.error).toBe('#NAME?');
  });

  it('公式参数里裸比较符仍然报 #NAME?', () => {
    const c = parseCriterion('>9', sheet, 'formula');
    expect(c.failure?.error).toBe('#NAME?');
  });

  it('单元格口径下裸文本按“等于”比较', () => {
    const c = parseCriterion('水果', sheet, 'cell');
    expect(c.failure).toBeNull();
    expect(c.test('水果')).toBe(true);
    expect(c.test('水果干')).toBe(false);
  });

  it('单元格口径下裸比较符按数值比较', () => {
    const c = parseCriterion('>9', sheet, 'cell');
    expect(c.failure).toBeNull();
    expect(c.test(10)).toBe(true);
    expect(c.test(9)).toBe(false);
  });

  it('单元格口径仍兼容旧的带引号写法', () => {
    const c = parseCriterion('"水果"', sheet, 'cell');
    expect(c.failure).toBeNull();
    expect(c.test('水果')).toBe(true);
  });

  it('单元格口径支持通配符', () => {
    const c = parseCriterion('*果*', sheet, 'cell');
    expect(c.failure).toBeNull();
    expect(c.test('苹果')).toBe(true);
    expect(c.test('白菜')).toBe(false);
  });
});

