import type { FunctionEntry } from '@/types';

/** CHIDIST · 卡方分布（compatibility 类 B9 批次） */

const chidistEntry: FunctionEntry = {
  id: 'chidist',
  enName: 'CHIDIST',
  zhName: '卡方分布',
  zhCommon: ['CHIDIST', '卡方'],
  alias: ['卡方右尾'],
  category: 'compatibility',
  abbr: 'kffb',
  pinyin: 'kafangfenbu',
  keywords: ['chidist', '卡方', '分布'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算卡方分布的右尾概率',
  summary: 'CHIDIST 返回卡方分布在自由度 df 下、≥x 的右尾概率，卡方检验用。',
  syntax: { patternCn: '=CHIDIST(x, 自由度)', patternEn: '=CHIDIST(x, deg_freedom)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: '检验统计量' },
    { key: 'df', zh: '自由度', en: 'deg_freedom', required: true, desc: '自由度' }] },
  returnValue: '右尾概率',
  examples: [{ title: '示例：卡方右尾', scene: 'x=3、df=5', dataAnchor: 'B2', formula: '=CHIDIST(3,5)', result: '约 0.6999', explanation: 'P(X≥3 | df=5)。' }],
  pitfalls: [{ title: '返回右尾', reason: '旧版 CHIDIST 是右尾，与部分教材左尾相反。', fix: '需左尾用 1-CHIDIST。', level: 'mid' }],
  related: [{ id: 'chiinv', kind: 'companion', why: 'CHIINV 与本品类相关' },
    { id: 'chitest', kind: 'companion', why: 'CHITEST 与本品类相关' },
    { id: 'fdist', kind: 'companion', why: 'FDIST 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'text', default: '3' },
      { key: 'df', label: '自由度 df', type: 'text', default: '5' },
    ],
    template: '=CHIDIST({x},{df})',
    cases: [
      { label: '右尾概率', type: 'ok', values: {}, expect: '0.699986', note: 'P(X>x) 的右尾卡方概率。' },
      { label: 'x 为负', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'x 必须大于等于 0。' },
      { label: '自由度非正', type: 'error', values: { df: '0' }, expect: '#NUM!', note: 'df 必须是不小于 1 的整数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default chidistEntry;
