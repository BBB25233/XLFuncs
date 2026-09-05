import type { FunctionEntry } from '@/types';

/** FINV · F反函数（compatibility 类 B9 批次） */

const finvEntry: FunctionEntry = {
  id: 'finv',
  enName: 'FINV',
  zhName: 'F反函数',
  zhCommon: ['FINV', 'F反'],
  alias: ['F 临界值'],
  category: 'compatibility',
  abbr: 'ffhs',
  pinyin: 'ffanhanshu',
  keywords: ['finv', 'F分布', '反函数'],
  difficulty: 4,
  usageLevel: 2,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由概率反查 F 临界值',
  summary: 'FINV 是 FDIST 的逆运算：给定右尾概率与两自由度反推 F 临界值。',
  syntax: { patternCn: '=FINV(概率, 分子自由度, 分母自由度)', patternEn: '=FINV(probability, deg_freedom1, deg_freedom2)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '右尾概率' },
    { key: 'df1', zh: '分子自由度', en: 'deg_freedom1', required: true, desc: '分子自由度' },
    { key: 'df2', zh: '分母自由度', en: 'deg_freedom2', required: true, desc: '分母自由度' }] },
  returnValue: 'F 临界值',
  examples: [{ title: '示例：F 临界值', scene: 'α=0.05、df=6/4', dataAnchor: 'B2', formula: '=FINV(0.05,6,4)', result: '约 6.16', explanation: '查表常用临界值。' }],
  pitfalls: [{ title: '与 FDIST 配对', reason: '两函数互逆。', fix: '已知概率求临界值用 FINV。', level: 'low' }],
  related: [{ id: 'fdist', kind: 'companion', why: 'FDIST 与本品类相关' },
    { id: 'ftest', kind: 'companion', why: 'FTEST 与本品类相关' },
    { id: 'chiinv', kind: 'companion', why: 'CHIINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率 p', type: 'text', default: '0.010258' },
      { key: 'df1', label: '自由度 df1', type: 'text', default: '6' },
      { key: 'df2', label: '自由度 df2', type: 'text', default: '4' },
    ],
    template: '=FINV({p},{df1},{df2})',
    cases: [
      { label: '逆 CDF', type: 'ok', values: {}, expect: '15.000037', note: 'FDIST 的逆函数，约回到 x=15。' },
      { label: 'p 越界', type: 'error', values: { p: '1.5' }, expect: '#NUM!', note: '需满足 0<p<=1。' },
      { label: '自由度非正', type: 'error', values: { df2: '0' }, expect: '#NUM!', note: 'df1、df2 必须是不小于 1 的整数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default finvEntry;
