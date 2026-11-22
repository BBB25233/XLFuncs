import type { FunctionEntry } from '@/types';

/** FDIST · F分布（compatibility 类 B9 批次） */

const fdistEntry: FunctionEntry = {
  id: 'fdist',
  enName: 'FDIST',
  zhName: 'F分布',
  zhCommon: ['FDIST', 'F分布'],
  alias: ['F 右尾'],
  category: 'compatibility',
  abbr: 'ffb',
  pinyin: 'ffenbu',
  keywords: ['fdist', 'F分布', '方差比'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算 F 分布的右尾概率',
  summary: 'FDIST 返回 F 分布在两自由度下、≥x 的右尾概率，方差齐性检验用。',
  syntax: { patternCn: '=FDIST(x, 分子自由度, 分母自由度)', patternEn: '=FDIST(x, deg_freedom1, deg_freedom2)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: 'F 统计量' },
    { key: 'df1', zh: '分子自由度', en: 'deg_freedom1', required: true, desc: '分子自由度' },
    { key: 'df2', zh: '分母自由度', en: 'deg_freedom2', required: true, desc: '分母自由度' }] },
  returnValue: '右尾概率',
  examples: [
    { title: '示例：F 右尾', scene: 'F=15、df=6/4', dataAnchor: 'B2', formula: '=FDIST(15,6,4)', result: '约 0.01', explanation: 'P(F≥15 | 6,4)。' },
    {
      title: '示例 2：同样算法，换三组自由度看看差别',
      scene: '方差齐性检验里 F 统计量算出来了，要按两组的自由度查右尾概率。自由度不同，同样的 F 值结论可能完全相反。',
      dataTsv: 'F 统计量\t分子自由度\t分母自由度\n2.5\t3\t20\n3.5\t5\t15\n6.16\t6\t4',
      dataAnchor: 'A1',
      formula: '=FDIST(A2,B2,C2)',
      result: 'F=2.5、3/20 → 0.088844，F=3.5、5/15 → 0.026969，F=6.16、6/4 → 0.050043',
      explanation: 'FDIST 给的是右尾概率 P(F≥x)。第 2、3 参数顺序不能反：分子自由度对应大方差那一组，分母自由度对应另一组，填反了结论会颠倒。',
    },
  ],
  pitfalls: [{ title: '自由度顺序', reason: '分子/分母自由度填反结果大变。', fix: '大方差组作分子。', level: 'mid' }],
  related: [{ id: 'finv', kind: 'companion', why: 'FINV 与本品类相关' },
    { id: 'ftest', kind: 'companion', why: 'FTEST 与本品类相关' },
    { id: 'chidist', kind: 'companion', why: 'CHIDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '15' },
      { key: 'df1', label: '自由度 df1', type: 'text', default: '6' },
      { key: 'df2', label: '自由度 df2', type: 'text', default: '4' },
    ],
    template: '=FDIST({x},{df1},{df2})',
    cases: [
      { label: '右尾 F 概率', type: 'ok', values: {}, expect: '0.010258', note: 'P(F>x) 的右尾概率。' },
      { label: 'x 为负', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须大于等于 0。' },
      { label: '自由度非正', type: 'error', values: { df1: '0' }, expect: '#NUM!', note: 'df1、df2 必须是不小于 1 的整数。' },
      { label: '❌ x 写成文本', type: 'error', values: { x: '二点五' }, expect: '#VALUE!', note: '意思：第 1 参数不是数字。F 统计量要填数值 2.5。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default fdistEntry;
