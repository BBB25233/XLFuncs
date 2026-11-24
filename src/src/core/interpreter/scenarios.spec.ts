import { describe, expect, it } from 'vitest';
import type { AstNode } from './ast';
import { parseWithDiagnostics } from './parser';
import { analyzeFormula } from '@/ui/interpreter/analyze';

function errorsOf(formula: string): string[] {
  return parseWithDiagnostics(formula).diagnostics
    .filter((item) => item.severity === 'error')
    .map((item) => `${item.code}:${item.message}`);
}

function astOf(formula: string): AstNode {
  const result = parseWithDiagnostics(formula);
  expect(result.ast).not.toBeNull();
  return result.ast as AstNode;
}

function codesOf(formula: string): string[] {
  return parseWithDiagnostics(formula).diagnostics.map((item) => item.code);
}

describe('解释器验收矩阵：合法公式不再报错', () => {
  it('跨表引用：普通表名 / 带空格表名 / 中文表名整列', () => {
    expect(errorsOf('=Sheet1!A1+1')).toEqual([]);
    expect(errorsOf("='My Sheet'!A1")).toEqual([]);
    expect(errorsOf("='2026年6月统计'!K:K")).toEqual([]);
    expect(codesOf('=Sheet1!A1+1')).toEqual([]);
    expect(codesOf("='My Sheet'!A1")).toEqual([]);
    const node = astOf('=Sheet1!A1+1');
    expect(node.kind).toBe('binary');
  });

  it('3D 引用与外部工作簿引用：合法且不提示 warning', () => {
    expect(errorsOf('=SUM(Sheet1:Sheet3!A1)')).toEqual([]);
    expect(errorsOf('=[Book1.xlsx]Sheet1!A1')).toEqual([]);
    expect(codesOf('=SUM(Sheet1:Sheet3!A1)')).toEqual([]);
    expect(codesOf('=[Book1.xlsx]Sheet1!A1')).toEqual([]);
  });

  it('整行引用', () => {
    expect(errorsOf('=SUM(1:1)')).toEqual([]);
    expect(errorsOf('=SUM($1:$1)')).toEqual([]);
  });

  it('表格结构化引用', () => {
    expect(errorsOf('=SUM(表1[金额])')).toEqual([]);
    expect(errorsOf('=[@金额]*2')).toEqual([]);
    expect(codesOf('=SUM(表1[金额])')).toContain('W407');
  });

  it('定义名称引用', () => {
    expect(errorsOf('=单价*数量')).toEqual([]);
    expect(errorsOf('=rate*2')).toEqual([]);
    expect(codesOf('=rate*2')).toContain('W408');
  });

  it('数组常量', () => {
    expect(errorsOf('=SUM({1,2;3,4})')).toEqual([]);
    const ast = astOf('=SUM({1,2;3,4})');
    expect(ast.kind).toBe('call');
    if (ast.kind === 'call') {
      expect(ast.args[0].kind).toBe('array');
      if (ast.args[0].kind === 'array') {
        expect(ast.args[0].rows).toHaveLength(2);
        expect(ast.args[0].rows[0]).toHaveLength(2);
      }
    }
  });

  it('动态数组：溢出引用与隐式交集', () => {
    expect(errorsOf('=SUM(A1#)')).toEqual([]);
    expect(errorsOf('=@A1:A3')).toEqual([]);
    expect(codesOf('=SUM(A1#)')).toContain('W409');
  });

  it('_xlfn 前缀函数', () => {
    expect(errorsOf('=_xlfn.XLOOKUP(A1,B:B,C:C)')).toEqual([]);
    expect(codesOf('=_xlfn.XLOOKUP(A1,B:B,C:C)')).toContain('W411');
  });

  it('科学计数法', () => {
    expect(errorsOf('=1E5+1')).toEqual([]);
    expect(errorsOf('=1.5E-3')).toEqual([]);

    const big = astOf('=1E5+1');
    expect(big.kind).toBe('binary');
    if (big.kind === 'binary') {
      expect(big.left.kind).toBe('number');
      if (big.left.kind === 'number') {
        expect(big.left.value).toBe(100000);
      }
    }

    const small = astOf('=1.5E-3');
    expect(small.kind).toBe('number');
    if (small.kind === 'number') {
      expect(small.value).toBeCloseTo(0.0015, 10);
    }
  });

  it('空参数不再当语法错误', () => {
    expect(errorsOf('=SUM(1,,3)')).toEqual([]);
    expect(errorsOf('=IF(TRUE,1,)')).toEqual([]);
    expect(codesOf('=SUM(1,,3)')).toContain('W414');
  });

  it('联合引用与交集引用', () => {
    expect(errorsOf('=SUM((A1:A3,B1:B3))')).toEqual([]);
    expect(errorsOf('=SUM(A1:A3 B2:B5)')).toEqual([]);
  });

  it('冒号两侧带空格', () => {
    expect(errorsOf('=SUM(A1 : A3)')).toEqual([]);
  });

  it('LAMBDA 立即调用', () => {
    expect(errorsOf('=LAMBDA(x,x*2)(3)')).toEqual([]);
  });

  it('欧陆分号参数', () => {
    expect(errorsOf('=SUM(1;2)')).toEqual([]);
    expect(codesOf('=SUM(1;2)')).toContain('W413');
  });

  it('用户原始 SUMIFS 公式：出结构、无 error', async () => {
    const formula =
      '=IFERROR(SUMIFS(Sheet1!$G:$G,Sheet1!$A:$A,">="&DATE(2026,1,1),Sheet1!$A:$A,"<="&DATE(2026,12,31))/SUMIFS(Sheet1!$A:$A,Sheet1!$A:$A,">="&DATE(2026,1,1),Sheet1!$A:$A,"<="&DATE(2026,12,31))*365,0)';
    const outcome = await analyzeFormula(formula);
    expect(outcome.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(outcome.result).not.toBeNull();
    expect(outcome.result?.steps.length ?? 0).toBeGreaterThan(0);
  });

  it('换行允许出现在参数、运算符等明确边界，只提示 W412', async () => {
    for (const formula of ['=SUM(\nA1:A3\n)', '=A1+\nB2', '=IF(A1,\n1,\n0)']) {
      const outcome = await analyzeFormula(formula);
      expect(outcome.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
      expect(outcome.diagnostics.map((item) => item.code)).toContain('W412');
      const warning = outcome.diagnostics.find((item) => item.code === 'W412');
      expect(warning?.fix?.label).toBe('取消换行');
      expect(warning?.fix?.text).not.toContain('\n');
      expect(outcome.result).not.toBeNull();
    }
  });

  it('字符串字面量内部的换行按文本处理，不报 E208', async () => {
    const outcome = await analyzeFormula('=IF(A1="a\nb",1,0)');
    expect(outcome.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(outcome.result).not.toBeNull();
  });

  it('取消换行不删除字符串字面量内部的换行', async () => {
    const formula = '=IF(A1="a\nb",\n1,0)';
    const outcome = await analyzeFormula(formula);
    const warning = outcome.diagnostics.find((item) => item.code === 'W412');
    expect(warning?.fix?.text).toContain('"a\nb"');
  });

  it('换行断在 Sheet1 中间：报 E208 并阻止解释', async () => {
    const formula =
      '=IFERROR(SUMIFS(Sheet1!$G:$G, Sheet1!$C:$C, $A3, Sheet1!$B:$B, "=20260630")/SUMIFS(Shee\nt1!$H:$H, Sheet1!$C:$C, A3, Sheet1!$B:$B, "=20260630")*365, 0)';
    const outcome = await analyzeFormula(formula);
    expect(outcome.diagnostics.map((item) => item.code)).toContain('E208');
    expect(outcome.diagnostics.map((item) => item.code)).toContain('W412');
    const warning = outcome.diagnostics.find((item) => item.code === 'W412');
    expect(warning?.fix?.label).toBe('取消换行');
    expect(warning?.fix?.text).not.toMatch(/[\r\n]/);
    expect(outcome.diagnostics.filter((item) => item.severity === 'error')).toHaveLength(1);
    const fixed = warning?.fix?.text ?? '';
    const fixedOutcome = await analyzeFormula(fixed);
    expect(fixedOutcome.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(fixedOutcome.result).not.toBeNull();
    expect(outcome.result).toBeNull();
    expect(codesOf('=SUM(条件区\n域1)')).toContain('E208');
  });

  it('真语法错误仍然阻止解释', () => {
    expect(codesOf('=SUM(A1:A3))')).toContain('E202');
    const dangling = codesOf('=1+');
    expect(dangling.includes('E204') || dangling.includes('E205')).toBe(true);
    expect(codesOf('=SUM(A1')).toContain('E201');
  });
});

describe('解释器验收矩阵：analyzeFormula 全链路', () => {
  const legal: Array<{ label: string; formula: string; warning: string }> = [
    { label: '跨表单格', formula: '=Sheet1!A1+1', warning: '' },
    { label: '带空格表名', formula: "='My Sheet'!A1", warning: '' },
    { label: '中文表名整列', formula: "='2026年6月统计'!K:K", warning: '' },
    { label: '3D 引用', formula: '=SUM(Sheet1:Sheet3!A1)', warning: '' },
    { label: '外部工作簿', formula: '=[Book1.xlsx]Sheet1!A1', warning: '' },
    { label: '整行', formula: '=SUM(1:1)', warning: '' },
    { label: '绝对整行', formula: '=SUM($1:$1)', warning: '' },
    { label: '结构化列', formula: '=SUM(表1[金额])', warning: 'W407' },
    { label: '结构化 @', formula: '=[@金额]*2', warning: 'W407' },
    { label: '结构化 #All', formula: '=SUM(表1[[#All],[金额]])', warning: 'W407' },
    { label: '中文名称', formula: '=单价*数量', warning: 'W408' },
    { label: '英文名称', formula: '=rate*2', warning: 'W408' },
    { label: '数组常量', formula: '=SUM({1,2;3,4})', warning: '' },
    { label: '溢出引用', formula: '=SUM(A1#)', warning: 'W409' },
    { label: '隐式交集', formula: '=@A1:A3', warning: 'W409' },
    { label: '_xlfn 前缀', formula: '=_xlfn.XLOOKUP(A1,B:B,C:C)', warning: 'W411' },
    { label: '科学计数大数', formula: '=1E5+1', warning: '' },
    { label: '科学计数小数', formula: '=1.5E-3', warning: '' },
    { label: '空参数中间', formula: '=SUM(1,,3)', warning: 'W414' },
    { label: '空参数末尾', formula: '=IF(TRUE,1,)', warning: 'W414' },
    { label: '联合引用', formula: '=SUM((A1:A3,B1:B3))', warning: '' },
    { label: '交集引用', formula: '=SUM(A1:A3 B2:B5)', warning: '' },
    { label: '冒号两侧空格', formula: '=SUM(A1 : A3)', warning: '' },
    { label: 'LAMBDA 立即调用', formula: '=LAMBDA(x,x*2)(3)', warning: 'W408' },
    { label: '分号分隔', formula: '=SUM(1;2)', warning: 'W413' },
    { label: '字符串里的引用符号', formula: '=IF(A1="a!b",1,0)', warning: '' },
    { label: '单引号表名转义', formula: "='It''s'!A1", warning: '' },
    { label: '跨表区域', formula: '=SUM(Sheet1!A1:A3)', warning: '' },
    { label: '多区域参数', formula: '=SUM(A1:B2,C1:D2)', warning: '' },
    { label: 'IFERROR 嵌套', formula: '=IFERROR(1/0,0)', warning: '' },
    { label: '绝对区域', formula: '=SUM($A$1:$B$2)', warning: '' },
    { label: '连续幂运算', formula: '=2^3^2', warning: '' },
    { label: '比较与连接', formula: '=IF(A1<>""&B1,1,0)', warning: '' },
    { label: '全角括号逗号', formula: '=SUM（1，2）', warning: 'W405' },
  ];

  it.each(legal)('$label：$formula 无 error 且出解释', async ({ formula, warning }) => {
    const outcome = await analyzeFormula(formula);
    expect(outcome.diagnostics.filter((item) => item.severity === 'error')).toEqual([]);
    expect(outcome.result).not.toBeNull();
    if (warning !== '') {
      expect(outcome.diagnostics.map((item) => item.code)).toContain(warning);
    }
  });

  it('数组常量行列不齐仍报 E206', () => {
    expect(codesOf('=SUM({1,2;3})')).toContain('E206');
  });

  it('一段结构化引用只报一条 W407，不逐字符刷屏', async () => {
    const outcome = await analyzeFormula('=SUM(表1[[#All],[金额]])');
    const codes = outcome.diagnostics.map((item) => item.code);
    expect(codes.filter((code) => code === 'W407')).toHaveLength(1);
    expect(codes).not.toContain('E102');
  });
});
