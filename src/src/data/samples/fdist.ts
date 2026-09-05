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
  examples: [{ title: '示例：F 右尾', scene: 'F=15、df=6/4', dataAnchor: 'B2', formula: '=FDIST(15,6,4)', result: '约 0.01', explanation: 'P(F≥15 | 6,4)。' }],
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
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default fdistEntry;
