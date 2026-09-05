import type { FunctionEntry } from '@/types';

/** TDIST · 旧t分布（compatibility 类 B9 批次） */

const tdistEntry: FunctionEntry = {
  id: 'tdist',
  enName: 'TDIST',
  zhName: '旧t分布',
  zhCommon: ['TDIST', 't分布'],
  alias: ['t 分布'],
  category: 'compatibility',
  abbr: 'jtfb',
  pinyin: 'jiutfenbu',
  keywords: ['tdist', 't分布', '检验'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算 t 分布的尾部概率',
  summary: 'TDIST 返回 t 分布在自由度 df 下的尾部概率（tails 指定单/双尾）。新版请用 T.DIST。',
  syntax: { patternCn: '=TDIST(x, 自由度, 尾数)', patternEn: '=TDIST(x, deg_freedom, tails)', args: [{ key: 'x', zh: 'x', en: 'x', required: true, desc: 't 统计量（非负）' },
    { key: 'df', zh: '自由度', en: 'deg_freedom', required: true, desc: '自由度' },
    { key: 'tails', zh: '尾数', en: 'tails', required: true, desc: '1=单尾、2=双尾' }] },
  returnValue: '尾部概率',
  examples: [{ title: '示例：t 双尾', scene: 't=1.96、df=60、双尾', dataAnchor: 'B2', formula: '=TDIST(1.96,60,2)', result: '约 0.055', explanation: '双尾 p 值。' }],
  pitfalls: [{ title: 'x 须非负', reason: 'TDIST 要求 x≥0。', fix: '取绝对值再算。', level: 'mid' }],
  related: [{ id: 'tinv', kind: 'companion', why: 'TINV 与本品类相关' },
    { id: 'ttest', kind: 'companion', why: 'TTEST 与本品类相关' },
    { id: 'normsinv', kind: 'companion', why: 'NORMSINV 与本品类相关' }],
  calc: {
    enabled: true,
    ranges: {},
    fields: [
      { key: 'x', label: 'x', type: 'number', default: '1.96' },
      { key: 'df', label: '自由度', type: 'number', default: '60' },
      { key: 'tails', label: '尾数', type: 'select', options: [{ label: '1（单尾）', value: '1' }, { label: '2（双尾）', value: '2' }], default: '2' },
    ],
    template: '=TDIST({x},{df},{tails})',
    cases: [
      { label: 'ok 双尾', type: 'ok', values: {}, expect: '0.054645', note: 't=1.96、df=60 的双尾 p。' },
      { label: '非法：x<0', type: 'error', values: { x: '-1' }, expect: '#NUM!', note: 'Excel 要求 x≥0。' },
      { label: '非法：尾数错误', type: 'error', values: { tails: '3' }, expect: '#NUM!', note: '尾数只能 1 或 2。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default tdistEntry;
