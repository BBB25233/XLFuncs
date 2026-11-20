import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { checkSemantics } from './checks';
import type { Diagnostic, DiagnosticFix } from './diagnostics';
import { checkFormulaInput } from './validation';
import { parseWithDiagnostics } from './parser';

function applyFix(source: string, fix: DiagnosticFix): string {
  return source.slice(0, fix.start) + fix.text + source.slice(fix.end);
}

function firstFix(list: Diagnostic[]): DiagnosticFix {
  const item = list.find((diagnostic) => diagnostic.fix !== undefined);
  if (item?.fix === undefined) {
    throw new Error('没有可用的修复方案');
  }
  return item.fix;
}

function noErrors(source: string): void {
  const list = parseWithDiagnostics(source).diagnostics;
  expect(list.filter((item) => item.severity === 'error')).toEqual([]);
}

describe('一键修复后必须能重新解析', () => {
  it('E001 补上 =', () => {
    const source = 'SUM(A1:A3)';
    const fixed = applyFix(source, firstFix(checkFormulaInput(source)));
    expect(fixed).toBe('=SUM(A1:A3)');
    noErrors(fixed);
  });

  it('W405 全角等号转半角', () => {
    const source = '＝SUM(A1:A3)';
    const fixed = applyFix(source, firstFix(parseWithDiagnostics(source).diagnostics));
    expect(fixed).toBe('=SUM(A1:A3)');
    noErrors(fixed);
  });

  it('E003 删掉多余的 =', () => {
    const source = '==SUM(A1:A3)';
    const fixed = applyFix(source, firstFix(checkFormulaInput(source)));
    noErrors(fixed);
  });

  it('E201 补上右括号', () => {
    const source = '=SUM(A1:A3';
    const fixed = applyFix(source, firstFix(parseWithDiagnostics(source).diagnostics));
    expect(fixed).toBe('=SUM(A1:A3)');
    noErrors(fixed);
  });

  it('E202 删掉多余的右括号', () => {
    const source = '=SUM(A1:A3))';
    const fixed = applyFix(source, firstFix(parseWithDiagnostics(source).diagnostics));
    expect(fixed).toBe('=SUM(A1:A3)');
    noErrors(fixed);
  });

  it('E101 补上右引号', () => {
    const source = '="abc';
    const fixed = applyFix(source, firstFix(parseWithDiagnostics(source).diagnostics));
    expect(fixed).toBe('="abc"');
    noErrors(fixed);
  });

  it('E203 删掉多余的逗号', () => {
    const source = '=SUM(,A1)';
    const fixed = applyFix(source, firstFix(parseWithDiagnostics(source).diagnostics));
    expect(fixed).toBe('=SUM(A1)');
    noErrors(fixed);
  });

  it('E102 全角运算符转半角', () => {
    const source = '=1＋2';
    const fixed = applyFix(source, firstFix(parseWithDiagnostics(source).diagnostics));
    expect(fixed).toBe('=1+2');
    noErrors(fixed);
  });
});

describe('语义修复', () => {
  const vlookup = {
    id: 'vlookup',
    enName: 'VLOOKUP',
    zhName: 'VLOOKUP',
    oneLiner: '示例',
    syntax: {
      patternCn: '=VLOOKUP()',
      patternEn: '=VLOOKUP()',
      args: [
        { key: 'a', zh: '甲', en: 'a', required: true, desc: '' },
        { key: 'b', zh: '乙', en: 'b', required: true, desc: '' },
        { key: 'c', zh: '丙', en: 'c', required: true, desc: '' },
        { key: 'd', zh: '丁', en: 'd', required: false, desc: '' },
      ],
    },
  } as unknown as FunctionEntry;

  const entries = new Map([['VLOOKUP', vlookup]]);
  const known = new Set(['VLOOKUP']);

  const analyze = (source: string): Diagnostic[] => {
    const parsed = parseWithDiagnostics(source);
    if (parsed.ast === null) {
      throw new Error('AST 为空');
    }
    return checkSemantics(parsed.ast, { knownFunctions: known, entries, source });
  };

  it('E301 改成建议的函数名后可以解析', () => {
    const source = '=VLOKUP(A1,B1:C9,2)';
    const fixed = applyFix(source, firstFix(analyze(source)));
    expect(fixed).toBe('=VLOOKUP(A1,B1:C9,2)');
    noErrors(fixed);
  });

  it('W401 补上 ,0 后变成四个参数', () => {
    const source = '=VLOOKUP(A1,B1:C9,2)';
    const fixed = applyFix(source, firstFix(analyze(source)));
    expect(fixed).toBe('=VLOOKUP(A1,B1:C9,2,0)');
    noErrors(fixed);
  });
});
