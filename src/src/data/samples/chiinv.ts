import type { FunctionEntry } from '@/types';

/** CHIINV · 卡方反函数（compatibility 类 B9 批次） */

const chiinvEntry: FunctionEntry = {
  id: 'chiinv',
  enName: 'CHIINV',
  zhName: '卡方反函数',
  zhCommon: ['CHIINV', '卡方反'],
  alias: ['卡方临界值'],
  category: 'compatibility',
  abbr: 'kffhs',
  pinyin: 'kafangfanhanshu',
  keywords: ['chiinv', '卡方', '反函数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查卡方临界值',
  summary: 'CHIINV 是 CHIDIST 的逆运算：给定右尾概率与自由度反推临界值。',
  syntax: { patternCn: '=CHIINV(概率, 自由度)', patternEn: '=CHIINV(probability, deg_freedom)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '右尾概率' },
    { key: 'df', zh: '自由度', en: 'deg_freedom', required: true, desc: '自由度' }] },
  returnValue: '卡方临界值',
  examples: [{ title: '示例：卡方临界值', scene: 'α=0.05、df=5', dataAnchor: 'B2', formula: '=CHIINV(0.05,5)', result: '约 11.07', explanation: '查表常用的 5% 临界值。' }],
  pitfalls: [{ title: '与 CHIDIST 配对', reason: '两函数互逆。', fix: '已知概率求临界值用 CHIINV。', level: 'low' }],
  related: [{ id: 'chidist', kind: 'companion', why: 'CHIDIST 与本品类相关' },
    { id: 'chitest', kind: 'companion', why: 'CHITEST 与本品类相关' },
    { id: 'finv', kind: 'companion', why: 'FINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率 p', type: 'text', default: '0.6998957' },
      { key: 'df', label: '自由度 df', type: 'text', default: '5' },
    ],
    template: '=CHIINV({p},{df})',
    cases: [
      { label: '逆 CDF', type: 'ok', values: {}, expect: '3.000585', note: 'CHIDIST 的逆函数，约回到 x=3。' },
      { label: 'p 越界', type: 'error', values: { p: '1.5' }, expect: '#NUM!', note: '需满足 0<p<1。' },
      { label: '自由度非正', type: 'error', values: { df: '0' }, expect: '#NUM!', note: 'df 必须是不小于 1 的整数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default chiinvEntry;
