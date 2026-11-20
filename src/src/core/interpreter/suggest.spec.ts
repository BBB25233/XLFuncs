import { describe, expect, it } from 'vitest';
import { levenshtein, suggestFunctionName } from './suggest';

describe('levenshtein', () => {
  it('相同字符串距离为 0', () => {
    expect(levenshtein('SUM', 'SUM')).toBe(0);
  });

  it('空串距离等于另一侧长度', () => {
    expect(levenshtein('', 'SUM')).toBe(3);
    expect(levenshtein('SUM', '')).toBe(3);
  });

  it('单字符替换', () => {
    expect(levenshtein('SUM', 'SUN')).toBe(1);
  });

  it('经典用例 kitten → sitting', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});

describe('suggestFunctionName', () => {
  const names = ['VLOOKUP', 'HLOOKUP', 'SUM', 'SUMIF', 'IF', 'ROUND'];

  it('拼错时给出最接近的函数', () => {
    expect(suggestFunctionName('VLOKUP', names)).toBe('VLOOKUP');
  });

  it('大小写不敏感', () => {
    expect(suggestFunctionName('vlookp', names)).toBe('VLOOKUP');
  });

  it('差异过大时不给建议', () => {
    expect(suggestFunctionName('ZZZZZZ', names)).toBeNull();
  });

  it('名字过短不建议，避免噪声', () => {
    expect(suggestFunctionName('IF', names)).toBeNull();
  });

  it('完全匹配不自我建议', () => {
    expect(suggestFunctionName('SUM', names)).toBeNull();
  });

  it('距离相同时优先更短的名字', () => {
    expect(suggestFunctionName('ABD', ['ABC', 'AB'], { maxDistance: 1 })).toBe('AB');
  });
});

describe('短名字的阈值收紧', () => {
  it('4 个字符以内只允许 1 个编辑距离', () => {
    expect(suggestFunctionName('IFNA', ['IF', 'ERF'])).toBeNull();
    expect(suggestFunctionName('EXP', ['ERF', 'ABS'])).toBeNull();
  });

  it('长名字仍按 2 个编辑距离给建议', () => {
    expect(suggestFunctionName('VLOKUP', ['VLOOKUP'])).toBe('VLOOKUP');
  });
});
