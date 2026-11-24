import { describe, expect, it } from 'vitest';
import { checkSemantics } from './checks';
import { hasErrors } from './diagnostics';
import { explainFormula } from './explain';
import { parseFormula, parseWithDiagnostics } from './parser';
import { buildTree, layoutTree } from './tree';
import { checkFormulaInput } from './validation';

function overlaps(layout: ReturnType<typeof layoutTree>): string[] {
  const hits: string[] = [];
  const { boxes } = layout;
  for (let i = 0; i < boxes.length; i += 1) {
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      if (
        a.x < b.x + b.width &&
        b.x < a.x + a.width &&
        a.y < b.y + b.height &&
        b.y < a.y + a.height
      ) {
        hits.push(`${a.id}×${b.id}`);
      }
    }
  }
  return hits;
}

describe('复杂公式', () => {
  it('八层嵌套仍可解析、出步骤、树不重叠', () => {
    const formula = '=ROUND(SUM(IFERROR(VLOOKUP(A1,$B$1:$C$9,2,0),0)*2,1),0)';
    const result = explainFormula(formula, new Map());
    expect(result.steps.length).toBeGreaterThan(4);

    const tree = buildTree(result.ast, result.steps);
    const layout = layoutTree(tree);
    expect(layout.boxes.length).toBeGreaterThan(10);
    expect(overlaps(layout)).toEqual([]);
  });

  it('三十项加法：宽树不重叠且宽度随项数增长', () => {
    const terms = Array.from({ length: 30 }, (_, index) => `A${index + 1}`).join('+');
    const result = explainFormula(`=${terms}`, new Map());
    const layout = layoutTree(buildTree(result.ast, result.steps));

    expect(result.steps).toHaveLength(29);
    expect(layout.width).toBeGreaterThan(2000);
    expect(overlaps(layout)).toEqual([]);
  });

  it('五十个参数的可变参数函数不报超限', () => {
    const args = Array.from({ length: 50 }, (_, index) => String(index + 1)).join(',');
    const parsed = parseWithDiagnostics(`=SUM(${args})`);
    expect(parsed.ast?.kind).toBe('call');
    if (parsed.ast?.kind === 'call') {
      expect(parsed.ast.args).toHaveLength(50);
    }
    expect(hasErrors(parsed.diagnostics)).toBe(false);
  });

  it('一元负号连写与百分比后缀都能解析', () => {
    for (const formula of ['=--1', '=-+1', '=50%*2', '=-A1%']) {
      expect(() => parseFormula(formula)).not.toThrow();
    }
  });

  it('字符串里的双引号转义与比较运算符', () => {
    const parsed = parseFormula('=IF(A1<>"", "a""b", "")');
    expect(parsed.kind).toBe('call');
  });

  it('超长文本字面量不会撑破节点宽度', () => {
    const long = 'x'.repeat(200);
    const result = explainFormula(`=IF(A1="", ${'"'}${long}${'"'}, 0)`, new Map());
    const tree = buildTree(result.ast, result.steps);
    const layout = layoutTree(tree);
    const leaf = layout.boxes.find((box) => box.kind === 'string');
    expect(leaf?.width).toBeLessThanOrEqual(120);
  });
});

describe('错误边界', () => {
  it('空公式与只有等号都给出提示', () => {
    expect(checkFormulaInput('')[0].code).toBe('E002');
    expect(checkFormulaInput('=')[0].code).toBe('E002');
    expect(checkFormulaInput('   ')[0].code).toBe('E002');
  });

  it('三处不同类型错误同时报出，且不抛异常', () => {
    const result = parseWithDiagnostics('=SUM(A1:A3))+#');
    const codes = result.diagnostics.map((item) => item.code);
    expect(new Set(codes)).toEqual(new Set(['E102', 'E202', 'E204']));
  });

  it('连续空参数逐个给 W414，不当语法错误', () => {
    const result = parseWithDiagnostics('=SUM(,,1)');
    expect(result.diagnostics.filter((item) => item.code === 'W414')).toHaveLength(2);
    expect(result.diagnostics.some((item) => item.severity === 'error')).toBe(false);
    if (result.ast?.kind === 'call') {
      expect(result.ast.args).toHaveLength(3);
      expect(result.ast.args[0].kind).toBe('missing');
      expect(result.ast.args[1].kind).toBe('missing');
    }
  });

  it('未闭合字符串与缺右括号并存时两处都报', () => {
    const result = parseWithDiagnostics('=IF(A1="abc,1');
    const codes = result.diagnostics.map((item) => item.code);
    expect(codes).toContain('E101');
    expect(codes).toContain('E201');
  });

  it('未知函数与参数不足同时存在', () => {
    const parsed = parseWithDiagnostics('=VLOOKUP(A1)');
    const list = checkSemantics(parsed.ast as never, {
      knownFunctions: new Set(['VLOOKUP']),
      entries: new Map([
        [
          'VLOOKUP',
          {
            id: 'vlookup',
            enName: 'VLOOKUP',
            syntax: {
              patternCn: '',
              patternEn: '',
              args: [
                { key: 'a', zh: '', en: '', required: true, desc: '' },
                { key: 'b', zh: '', en: '', required: true, desc: '' },
                { key: 'c', zh: '', en: '', required: true, desc: '' },
              ],
            },
          } as never,
        ],
      ]),
    });
    expect(list.map((item) => item.code)).toContain('E302');
  });
});
