import type { FunctionEntry } from '@/types';

/** IMPOWER · 复数幂（engineering 类 B9 批次） */

const impowerEntry: FunctionEntry = {
  id: 'impower',
  enName: 'IMPOWER',
  zhName: '复数幂',
  zhCommon: ['IMPOWER', '复数乘方'],
  alias: ['复乘方'],
  category: 'engineering',
  abbr: 'fsm',
  pinyin: 'fushumi',
  keywords: ['impower', '复数', '幂'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '把复数升整数次幂',
  summary: 'IMPOWER 返回复数的 n 次幂（复数）。',
  syntax: { patternCn: '=IMPOWER(复数, 指数)', patternEn: '=IMPOWER(inumber, number)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' },
    { key: 'p', zh: '指数', en: 'number', required: true, desc: '整数指数' }] },
  returnValue: '复数幂',
  examples: [{ title: '示例：平方', scene: '复数 1+i 平方', dataAnchor: 'A2', formula: '=IMPOWER("1+i",2)', result: 'NaN+NaNi', explanation: '(1+i)² = 2i。' }],
  pitfalls: [{ title: '指数为整数', reason: '非整数幂结果按主值。', fix: '整数幂最直观。', level: 'low' }],
  related: [{ id: 'imsqrt', kind: 'companion', why: 'IMSQRT 与本品类相关' },
    { id: 'imexp', kind: 'companion', why: 'IMEXP 与本品类相关' },
    { id: 'imdiv', kind: 'companion', why: 'IMDIV 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
      { key: 'p', label: '指数', type: 'number', default: '2', placeholder: '2', hint: '只能是数字；非整数幂 Excel 按主值计算' },
    ],
    template: '=IMPOWER({n},{p})',
    cases: [
      { label: '默认：(1+i)²', type: 'ok', values: {}, expect: '2i', note: '(1+i)² = 1+2i+i² = 2i，实部正好为 0。' },
      { label: '2³ = 8', type: 'ok', values: { n: '"2"', p: '3' }, expect: '8', note: '没有虚部时退化成普通乘方。' },
      { label: '指数填文本 → #VALUE!', type: 'error', values: { p: 'abc' }, expect: '#VALUE!', note: '第 2 参数必须是数字，文本会 #VALUE!。' },
      { label: '0 的负次幂 → #NUM!', type: 'error', values: { n: '"0"', p: '-1' }, expect: '#NUM!', note: '0⁻¹ 相当于 1/0，Excel 报 #NUM!。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '底数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default impowerEntry;
