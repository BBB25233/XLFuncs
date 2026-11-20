import { describe, expect, it } from 'vitest';
import { FormulaParseError } from './errors';
import { checkFormulaInput, parseUserFormula } from './validation';
import { parseWithDiagnostics } from './parser';

function messageOf(source: string): string {
  try {
    parseUserFormula(source);
    return '';
  } catch (error) {
    if (error instanceof FormulaParseError) {
      return error.message;
    }
    return String(error);
  }
}

describe('parseUserFormula', () => {
  it('接受以 = 开头的公式', () => {
    expect(parseUserFormula('=SUM(A1:A3)').kind).toBe('call');
  });

  it('忽略前后空白', () => {
    expect(parseUserFormula('   =SUM(A1:A3)   ').kind).toBe('call');
  });

  it('拒绝不带 = 的公式', () => {
    expect(messageOf('SUM(A1:A3)')).toContain('以 = 开头');
    expect(messageOf('+A1*2')).toContain('以 = 开头');
  });

  it('拒绝空输入与只有等号的输入', () => {
    expect(messageOf('   ')).toContain('请输入完整公式');
    expect(messageOf('=')).toContain('请输入完整公式');
  });

  it('拒绝重复等号', () => {
    expect(messageOf('==SUM(A1)')).toContain('只能有一个');
  });

  it('全角等号不再阻断，交给词法层给警告', () => {
    expect(checkFormulaInput('＝SUM(A1)')).toEqual([]);
    const list = parseWithDiagnostics('＝SUM(A1)').diagnostics;
    expect(list.map((item) => item.code)).toContain('W405');
  });

  it('错误带字符位置', () => {
    try {
      parseUserFormula('SUM(A1)');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(FormulaParseError);
      expect((error as FormulaParseError).position).toBe(0);
    }
  });
});
