import { describe, expect, it } from 'vitest';
import { truncateMiddle } from './text';

describe('truncateMiddle', () => {
  it('短文本原样返回', () => {
    expect(truncateMiddle('A1:A3', 46)).toBe('A1:A3');
  });

  it('超长文本保留头尾，总长度等于上限', () => {
    const path = 'C:/Users/Example/Documents/Reports/2026/November/data.csv';
    const short = truncateMiddle(path, 30);

    expect(short).toHaveLength(30);
    expect(short).toContain('…');
    expect(short.startsWith('C:/Users')).toBe(true);
    expect(short.endsWith('data.csv')).toBe(true);
  });

  it('恰好等于上限时不处理', () => {
    const text = 'x'.repeat(20);
    expect(truncateMiddle(text, 20)).toBe(text);
  });
});
