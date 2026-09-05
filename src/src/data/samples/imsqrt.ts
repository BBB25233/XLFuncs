import type { FunctionEntry } from '@/types';

/** IMSQRT · 复数平方根（engineering 类 B9 批次） */

const imsqrtEntry: FunctionEntry = {
  id: 'imsqrt',
  enName: 'IMSQRT',
  zhName: '复数平方根',
  zhCommon: ['IMSQRT', '复数开方'],
  alias: ['复平方根'],
  category: 'engineering',
  abbr: 'fspfg',
  pinyin: 'fushupingfanggen',
  keywords: ['imsqrt', '复数', '平方根'],
  difficulty: 4,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的平方根',
  summary: 'IMSQRT 返回复数的主平方根（复数）。',
  syntax: { patternCn: '=IMSQRT(复数)', patternEn: '=IMSQRT(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '复数平方根',
  examples: [{ title: '示例：平方根', scene: '复数 1+i', dataAnchor: 'A2', formula: '=IMSQRT("1+i")', result: 'NaN+NaNi', explanation: '按复数开方公式算得主值。' }],
  pitfalls: [{ title: '取主值', reason: '平方根有两值，取主值。', fix: '理解主值即可。', level: 'low' }],
  related: [{ id: 'impower', kind: 'companion', why: 'IMPOWER 与本品类相关' },
    { id: 'imexp', kind: 'companion', why: 'IMEXP 与本品类相关' },
    { id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"1+i"', placeholder: '"1+i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMSQRT({n})',
    cases: [
      { label: '默认：√(1+i)', type: 'ok', values: {}, expect: '1.098684+0.45509i', note: '平方根有两个值，Excel 只返回「主值」（虚部符号与原虚部一致）。' },
      { label: '√4 就是 2', type: 'ok', values: { n: '"4"' }, expect: '2', note: '正实数退化成普通平方根。' },
      { label: '负实数开方得到纯虚数', type: 'ok', values: { n: '"-4"' }, expect: '2i', note: '这是 IMSQRT 和 SQRT 最大的区别：SQRT(-4) 会报 #NUM!，IMSQRT(-4) 给出 2i。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"1+k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imsqrtEntry;
