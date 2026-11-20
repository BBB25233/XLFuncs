import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import { checkSemantics } from './checks';
import type { EntryMap } from './model';
import { parseFormula } from './parser';

function makeEntry(
  enName: string,
  required: number,
  total: number,
  patternEn = `=${enName}()`,
): FunctionEntry {
  const args = Array.from({ length: total }, (_, index) => ({
    key: `a${index}`,
    zh: `参数${index + 1}`,
    en: `a${index}`,
    required: index < required,
    desc: '',
  }));

  return {
    id: enName.toLowerCase(),
    enName,
    zhName: enName,
    oneLiner: '示例条目',
    syntax: { patternCn: `=${enName}()`, patternEn, args },
  } as unknown as FunctionEntry;
}

const vlookup = makeEntry('VLOOKUP', 3, 4);
const abs = makeEntry('ABS', 1, 1);
const round = makeEntry('ROUND', 2, 2);
const sum = makeEntry('SUM', 1, 1, '=SUM(number1, [number2], ...)');

const entries: EntryMap = new Map([
  ['VLOOKUP', vlookup],
  ['ABS', abs],
  ['ROUND', round],
  ['SUM', sum],
]);

const known = new Set(['VLOOKUP', 'ABS', 'ROUND', 'SUM']);

function run(formula: string, map: EntryMap = entries, names: ReadonlySet<string> = known) {
  return checkSemantics(parseFormula(formula), { knownFunctions: names, entries: map });
}

describe('checkSemantics', () => {
  it('未知函数给出拼写建议与修复区间', () => {
    const list = run('=VLOKUP(A1,B1:C9,2)');
    const item = list.find((diagnostic) => diagnostic.code === 'E301');
    expect(item?.message).toContain('VLOOKUP');
    expect(item?.fix).toMatchObject({ text: 'VLOOKUP', start: 1, end: 7 });
  });

  it('必填参数不足报 E302', () => {
    const list = run('=VLOOKUP(A1,B1:C9)');
    expect(list.map((item) => item.code)).toContain('E302');
  });

  it('参数超上限报 W301', () => {
    const list = run('=ABS(1,2)');
    const item = list.find((diagnostic) => diagnostic.code === 'W301');
    expect(item?.severity).toBe('warning');
  });

  it('可变参数函数不报超限', () => {
    const list = run('=SUM(1,2,3,4)');
    expect(list.map((item) => item.code)).not.toContain('W301');
  });

  it('VLOOKUP 省略第 4 参数时提示近似匹配', () => {
    const list = run('=VLOOKUP(A1,B1:C9,2)');
    expect(list.map((item) => item.code)).toContain('W401');
  });

  it('近似匹配 + 整列引用才提示表头风险，并标在引用上', () => {
    const list = run('=VLOOKUP(A1,B:C,2)');
    const item = list.find((diagnostic) => diagnostic.code === 'W402');
    expect(item).toMatchObject({ start: 12, end: 15 });
  });

  it('精确匹配的整列引用不告警', () => {
    const list = run('=VLOOKUP(A1,B:C,2,0)');
    expect(list.map((item) => item.code)).not.toContain('W402');
  });

  it('已收录但未加载到条目时只提示未收录', () => {
    const list = run('=SUM(1,2)', new Map(), new Set(['SUM']));
    expect(list.map((item) => item.code)).toEqual(['W403']);
  });

  it('嵌套调用逐个检查，外层合法不影响内层报错', () => {
    const list = run('=ROUND(FOO(1),2)');
    const unknown = list.filter((item) => item.code === 'W403');
    expect(unknown).toHaveLength(1);
    expect(unknown[0].message).toContain('FOO');
  });

  it('完全不像任何已知函数的名称只提示未收录，不判错', () => {
    const list = run('=EXP(1)');
    expect(list.map((item) => item.code)).toEqual(['W403']);
    expect(list[0].severity).toBe('warning');
  });

  it('合法公式不产生任何诊断', () => {
    expect(run('=VLOOKUP(A1,B1:C9,2,0)')).toEqual([]);
  });
});

describe('短函数名的误报防护', () => {
  it('IFNA 这类 4 字母真实函数不被判成 ISNA 的错拼', () => {
    const list = checkSemantics(parseFormula('=IFNA(A2,1)'), {
      knownFunctions: new Set([...known, 'ISNA']),
      entries,
    });
    expect(list.map((item) => item.code)).toEqual(['W403']);
  });
});
