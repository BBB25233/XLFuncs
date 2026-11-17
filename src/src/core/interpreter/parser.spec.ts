import { describe, expect, it } from 'vitest';
import type { AstNode } from './ast';
import { FormulaParseError } from './errors';
import { parseFormula } from './parser';

function expectBinary(node: AstNode): Extract<AstNode, { kind: 'binary' }> {
  if (node.kind !== 'binary') {
    throw new Error(`期望二元运算，实际是 ${node.kind}`);
  }
  return node;
}

describe('parseFormula', () => {
  it('乘法优先于加法', () => {
    const root = expectBinary(parseFormula('1+2*3'));
    expect(root.op).toBe('+');
    expect(root.right.kind).toBe('binary');
    expect((root.right as Extract<AstNode, { kind: 'binary' }>).op).toBe('*');
  });

  it('括号改变结合顺序', () => {
    const root = expectBinary(parseFormula('(1+2)*3'));
    expect(root.op).toBe('*');
    expect(root.left.kind).toBe('binary');
  });

  it('解析嵌套函数与比较运算', () => {
    const node = parseFormula('IF(A1>0,SUM(B1:B3),0)');
    expect(node.kind).toBe('call');
    if (node.kind !== 'call') return;
    expect(node.name).toBe('IF');
    expect(node.args).toHaveLength(3);
    expect(node.args[0].kind).toBe('binary');
    expect(node.args[1].kind).toBe('call');
  });

  it('允许前导等号，且不改变节点区间', () => {
    const withEquals = parseFormula('=SUM(A1:A2)');
    const without = parseFormula('SUM(A1:A2)');
    expect(withEquals.kind).toBe('call');
    expect(without.start).toBe(0);
  });

  it('一元负号与百分号', () => {
    const negative = parseFormula('-A1');
    expect(negative.kind).toBe('unary');
    const percent = parseFormula('A1%');
    expect(percent.kind).toBe('unary');
  });

  it('缺少右括号时报错并给出末尾位置', () => {
    try {
      parseFormula('=SUM(A1:A9');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(FormulaParseError);
      expect((error as FormulaParseError).message).toContain('右括号');
    }
  });

  it('空公式报错', () => {
    expect(() => parseFormula('   ')).toThrow(FormulaParseError);
  });
});
