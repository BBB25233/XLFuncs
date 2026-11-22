import type { FunctionEntry } from '@/types';

/** TINV · t反函数（compatibility 类 B9 批次） */

const tinvEntry: FunctionEntry = {
  id: 'tinv',
  enName: 'TINV',
  zhName: 't反函数',
  zhCommon: ['TINV', 't反'],
  alias: ['t 临界值'],
  category: 'compatibility',
  abbr: 'tfhs',
  pinyin: 'tfanhanshu',
  keywords: ['tinv', 't分布', '反函数'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '由双尾概率反查 t 临界值',
  summary: 'TINV 是 TDIST 双尾的逆运算：给定双尾概率与自由度反推 t 临界值。新版请用 T.INV.2T。',
  syntax: { patternCn: '=TINV(概率, 自由度)', patternEn: '=TINV(probability, deg_freedom)', args: [{ key: 'p', zh: '概率', en: 'probability', required: true, desc: '双尾概率' },
    { key: 'df', zh: '自由度', en: 'deg_freedom', required: true, desc: '自由度' }] },
  returnValue: 't 临界值',
  examples: [{ title: '示例：t 临界值', scene: 'α=0.05、df=60', dataAnchor: 'B2', formula: '=TINV(0.05,60)', result: '约 2.00', explanation: '常用 5% 双尾临界值。' },
    { title: '示例 2：小样本查 95% 临界值', scene: '只有 10 个样本做配对 t 检验，自由度 9，需要在 5% 双尾水平上找临界值，看算出的 t 值够不够大。', dataAnchor: 'B2', formula: '=TINV(0.05,9)', result: '约 2.262', explanation: '自由度越小，t 分布尾巴越厚，门槛就越高：df=9 要 2.262，df=60 只要 2.00，而正态的 1.96 只在样本很大时才够用。' }],
  pitfalls: [{ title: 'TINV 是双尾', reason: '旧版 TINV 接收的是双尾概率。', fix: '单尾情形先乘 2。', level: 'mid' }],
  related: [{ id: 'tdist', kind: 'companion', why: 'TDIST 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' },
    { id: 'chiinv', kind: 'companion', why: 'CHIINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'p', label: '概率', type: 'number', default: '0.05444' },
      { key: 'df', label: '自由度', type: 'number', default: '60' },
    ],
    template: '=TINV({p},{df})',
    cases: [
      { label: 'ok 临界值', type: 'ok', values: {}, expect: '1.961715', note: '双尾 p=0.05444 对应的 t。' },
      { label: '非法：概率越界', type: 'error', values: { p: '2' }, expect: '#NUM!', note: '概率必须 0<p<1。' },
      { label: '非法：自由度=0', type: 'error', values: { df: '0' }, expect: '#NUM!', note: '自由度必须 ≥1。' },
      { label: '非法：p 取边界 0', type: 'error', values: { p: '0' }, expect: '#NUM!', note: '概率必须严格落在 0 和 1 之间。' },
      { label: '非法：自由度非整数', type: 'error', values: { df: '2.5' }, expect: '#NUM!', note: '自由度必须是整数，不能填 2.5。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default tinvEntry;
