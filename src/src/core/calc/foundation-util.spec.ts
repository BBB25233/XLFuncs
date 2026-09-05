import { describe, it, expect } from 'vitest';
import {
  transpose,
  multiply,
  determinant,
  inverse,
  solve,
} from './matrix';
import { percentileInc, percentileExc, rank, quantileSorted } from './quantile';
import { byteLen, byteSubstr } from './byte';

describe('matrix', () => {
  it('transpose', () => {
    expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
  });

  it('multiply', () => {
    expect(multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])).toEqual([[19, 22], [43, 50]]);
  });

  it('determinant', () => {
    expect(determinant([[1, 2], [3, 4]])).toBe(-2);
  });

  it('inverse', () => {
    const inv = inverse([[4, 7], [2, 6]])!;
    expect(inv[0][0]).toBeCloseTo(0.6, 9);
    expect(inv[0][1]).toBeCloseTo(-0.7, 9);
    expect(inv[1][0]).toBeCloseTo(-0.2, 9);
    expect(inv[1][1]).toBeCloseTo(0.4, 9);
  });

  it('solve', () => {
    const x = solve([[2, 1], [1, 1]], [3, 2])!;
    expect(x[0]).toBeCloseTo(1, 9);
    expect(x[1]).toBeCloseTo(1, 9);
  });
});

describe('quantile', () => {
  it('percentileInc', () => {
    expect(percentileInc([1, 2, 3, 4], 0.5)).toBe(2.5);
  });

  it('rank', () => {
    expect(rank(3, [3, 1, 3, 2], 0)).toBe(1.5);
  });
});

describe('byte', () => {
  it('byteLen', () => {
    expect(byteLen('AB中')).toBe(4);
  });

  it('byteSubstr', () => {
    expect(byteSubstr('AB中', 0, 1)).toBe('A');
    expect(byteSubstr('AB中', 1, 1)).toBe('B');
    expect(byteSubstr('AB中', 2, 2)).toBe('中');
  });
});

// 占位引用，确保 quantileSorted / percentileExc 被覆盖（类型与导出检查）
describe('quantile extras', () => {
  it('quantileSorted', () => {
    expect(quantileSorted([1, 2, 3, 4], 0.5)).toBeCloseTo(2.5, 9);
  });
  it('percentileExc', () => {
    expect(percentileExc([1, 2, 3, 4, 5], 0.5)).toBeCloseTo(3, 9);
  });
});
