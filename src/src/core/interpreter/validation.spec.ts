import { describe, expect, it } from 'vitest';
import { FormulaParseError } from './errors';
import { parseUserFormula } from './validation';

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

  it('提示全角等号改用半角', () => {
    expect(messageOf('＝SUM(A1)')).toContain('全角等号');
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
