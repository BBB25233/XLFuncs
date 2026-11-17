import { describe, expect, it } from 'vitest';
import type { FunctionEntry } from '@/types';
import absEntry from '@/data/samples/abs';
import { explainFormula } from './explain';
import type { EntryMap } from './model';

const SAMPLE = '=IFERROR(VLOOKUP(A2,D:F,3,0)*C2+SUM(B2:B10),"未找到")';
const emptyEntries: EntryMap = new Map();

describe('explainFormula', () => {
  it('样例公式分解为 5 步，顺序为先内层后外层', () => {
    const result = explainFormula(SAMPLE, emptyEntries);
    expect(result.steps).toHaveLength(5);
    expect(result.steps.map((step) => step.n)).toEqual([1, 2, 3, 4, 5]);
    expect(result.steps.map((step) => step.title)).toEqual([
      expect.stringContaining('VLOOKUP'),
      expect.stringContaining('乘法'),
      expect.stringContaining('SUM'),
      expect.stringContaining('加法'),
      expect.stringContaining('IFERROR'),
    ]);
  });

  it('VLOOKUP 换算出目标列，并给出可读明细', () => {
    const step = explainFormula(SAMPLE, emptyEntries).steps[0];
    expect(step.detail.join(' ')).toContain('（F 列）');
    expect(step.rows.map((row) => row.k)).toEqual([
      '查什么',
      '去哪查',
      '怎么算命中',
      '取什么',
      '找不到时',
    ]);
    expect(step.warnings.join(' ')).toContain('表头');
  });

  it('每个步骤都有至少 3 行明细，且不输出结果数值', () => {
    const result = explainFormula(SAMPLE, emptyEntries);
    for (const step of result.steps) {
      expect(step.rows.length).toBeGreaterThanOrEqual(3);
      expect(step.detail.join(' ')).not.toMatch(/结果\s*=\s*-?\d/);
    }
  });

  it('IFERROR 会提示改用 IFNA', () => {
    const last = explainFormula(SAMPLE, emptyEntries).steps[4];
    expect(last.warnings.join(' ')).toContain('IFNA');
  });

  it('总述包含步数与执行顺序', () => {
    expect(explainFormula(SAMPLE, emptyEntries).summary).toContain('共分解为 5 步');
  });

  it('根节点是函数调用时不出分支结构', () => {
    expect(explainFormula(SAMPLE, emptyEntries).structure).toBeUndefined();
  });

  it('两支都足够复杂时给出左右分支与汇合点', () => {
    const formula = '=IF(A1>0,SUM(B1:B3),0)+ROUND(C1*D1,2)';
    const result = explainFormula(formula, emptyEntries);
    const branch = result.structure?.branch;

    expect(branch).toBeDefined();
    if (branch === undefined) {
      return;
    }
    expect(branch.left.length).toBeGreaterThanOrEqual(2);
    expect(branch.right.length).toBeGreaterThanOrEqual(2);
    expect(branch.merge).toBe(result.steps.length);
    expect(Math.max(...branch.left)).toBeLessThan(Math.min(...branch.right));
  });

  it('单支过于简单时不拆分支', () => {
    const result = explainFormula('=SUM(A1:A3)+ROUND(B1*C1,2)', emptyEntries);
    expect(result.structure?.branch).toBeUndefined();
  });

  it('三支相加时改为 A/B/C 分组而非分列', () => {
    const formula = '=SUM(A1:A3)+ROUND(B1*C1,2)+IF(D1>0,1,0)';
    const result = explainFormula(formula, emptyEntries);
    const groups = result.structure?.groups;

    expect(result.structure?.branch).toBeUndefined();
    expect(groups).toBeDefined();
    if (groups === undefined) {
      return;
    }
    expect(groups.groups.map((group) => group.label)).toEqual(['A', 'B', 'C']);
    expect(groups.merge).toBe(result.steps.length);
    expect(groups.merges.length).toBeGreaterThanOrEqual(1);

    const labels = result.steps.map((step) => step.groupLabel);
    expect(labels.filter((label) => label === 'A')).toHaveLength(groups.groups[0].numbers.length);
    expect(labels.filter((label) => label === 'B')).toHaveLength(groups.groups[1].numbers.length);
    expect(labels.filter((label) => label === '汇合')).toHaveLength(groups.merges.length);
  });

  it('已收录函数可从条目取到中文名与详情链接', () => {
    const entries: EntryMap = new Map([['ABS', absEntry]]);
    const step = explainFormula('=ABS(A2)', entries).steps[0];
    expect(step.fnId).toBe('abs');
    expect(step.title).toContain('绝对值');
  });

  it('未收录函数降级为结构说明', () => {
    const result = explainFormula('=FOOBAR(A1,2)', emptyEntries);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].warnings.join(' ')).toContain('暂未收录');
    expect(result.steps[0].rows).toHaveLength(2);
  });

  it('必填参数不足时给出提示', () => {
    const fakeEntry = {
      id: 'demo',
      enName: 'DEMO',
      zhName: '演示函数',
      oneLiner: '仅用于测试',
      syntax: {
        patternCn: '=DEMO(甲, 乙)',
        patternEn: '=DEMO(a, b)',
        args: [
          { key: 'a', zh: '甲', en: 'a', required: true, desc: '' },
          { key: 'b', zh: '乙', en: 'b', required: true, desc: '' },
        ],
      },
    } as unknown as FunctionEntry;
    const entries: EntryMap = new Map([['DEMO', fakeEntry]]);
    const step = explainFormula('=DEMO(1)', entries).steps[0];
    expect(step.warnings.join(' ')).toContain('至少需要 2 个参数');
  });
});
