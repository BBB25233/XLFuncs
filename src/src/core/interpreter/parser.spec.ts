import { describe, expect, it } from 'vitest';
import type { AstNode } from './ast';
import { FormulaParseError } from './errors';
import { parseFormula, parseWithDiagnostics } from './parser';

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

describe('parseWithDiagnostics（错误恢复）', () => {
  it('缺少右括号：给出 E201，同时保留可用的 AST', () => {
    const result = parseWithDiagnostics('=SUM(A1:A3');
    expect(result.ast?.kind).toBe('call');
    const codes = result.diagnostics.map((item) => item.code);
    expect(codes).toContain('E201');
    expect(result.diagnostics[0].start).toBe(10);
  });

  it('多余右括号：给出 E202 且继续解析', () => {
    const result = parseWithDiagnostics('=SUM(A1:A3))');
    expect(result.diagnostics.map((item) => item.code)).toContain('E202');
    expect(result.ast?.kind).toBe('call');
  });

  it('末尾运算符：报缺少操作数', () => {
    const result = parseWithDiagnostics('=1+');
    expect(result.diagnostics.some((item) => item.code === 'E204' || item.code === 'E205')).toBe(true);
  });

  it('空参数给 W414 提示，AST 保留空的参数位', () => {
    const result = parseWithDiagnostics('=SUM(,A1)');
    expect(result.diagnostics.map((item) => item.code)).toContain('W414');
    expect(result.diagnostics.every((item) => item.severity === 'warning')).toBe(true);
    if (result.ast?.kind === 'call') {
      expect(result.ast.args).toHaveLength(2);
      expect(result.ast.args[0].kind).toBe('missing');
    }
  });

  it('一次报出多处错误', () => {
    const result = parseWithDiagnostics('=SUM(A1:A3))+#');
    expect(result.diagnostics.length).toBeGreaterThanOrEqual(3);
    expect(new Set(result.diagnostics.map((item) => item.code))).toEqual(
      new Set(['E102', 'E202', 'E204']),
    );
  });

  it('严格 parseFormula 对同一输入仍然抛错', () => {
    expect(() => parseFormula('=SUM(A1:A3')).toThrow(FormulaParseError);
  });

  it('诊断区间落在出错字符上', () => {
    const result = parseWithDiagnostics('=1#2');
    const item = result.diagnostics.find((diagnostic) => diagnostic.code === 'E102');
    expect(item).toMatchObject({ start: 2, end: 3 });
  });
});
