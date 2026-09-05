import { describe, expect, it } from 'vitest';
import { buildFormulaPayload, escape, isNumeric, parseTsv, stringify } from '@/core/tsv';

describe('TSV 纯函数（缺陷 #3 补测）', () => {
  it('isNumeric：纯数字/负数/小数/科学计数法为真，空/文本为假', () => {
    expect(isNumeric('5')).toBe(true);
    expect(isNumeric('-3.2')).toBe(true);
    expect(isNumeric('1e3')).toBe(true);
    expect(isNumeric('')).toBe(false);
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric('5a')).toBe(false);
  });

  it('stringify 行尾用 \\r\\n 且可与 parseTsv 互转', () => {
    const rows: string[][] = [
      ['工号', '姓名'],
      ['A001', '张三'],
    ];
    const tsv = stringify(rows);
    expect(tsv).toBe('工号\t姓名\r\nA001\t张三');
    expect(parseTsv(tsv)).toEqual(rows);
  });

  it('buildFormulaPayload 只返回修剪后的公式原文', () => {
    expect(buildFormulaPayload('  =SUM(A1:A10)  ')).toBe('=SUM(A1:A10)');
  });

  it('escape：公式前缀补单引号、制表符/换行被转义、首尾去空格', () => {
    expect(escape('=A1')).toBe("'=A1");
    expect(escape('a\tb\nc')).toBe('a  b c');
    expect(escape('  hello  ')).toBe('hello');
  });
});
