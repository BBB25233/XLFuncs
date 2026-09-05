import type { FunctionEntry } from '@/types';

/** IMCONJUGATE · 复数共轭（engineering 类 B9 批次） */

const imconjugateEntry: FunctionEntry = {
  id: 'imconjugate',
  enName: 'IMCONJUGATE',
  zhName: '复数共轭',
  zhCommon: ['IMCONJUGATE', '共轭'],
  alias: ['取共轭'],
  category: 'engineering',
  abbr: 'fsge',
  pinyin: 'fushugonge',
  keywords: ['imconjugate', '复数', '共轭'],
  difficulty: 3,
  usageLevel: 3,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '取复数的共轭',
  summary: 'IMCONJUGATE 把虚部取反，得到共轭复数（实部不变）。',
  syntax: { patternCn: '=IMCONJUGATE(复数)', patternEn: '=IMCONJUGATE(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '共轭复数',
  examples: [{ title: '示例：共轭', scene: '复数 3+4i', dataAnchor: 'A2', formula: '=IMCONJUGATE("3+4i")', result: '3-4i', explanation: '虚部取反。' }],
  pitfalls: [{ title: '只变虚部符号', reason: '实部不变。', fix: '共轭 = 实部相同、虚部相反。', level: 'low' }],
  related: [{ id: 'imaginary', kind: 'companion', why: 'IMAGINARY 与本品类相关' },
    { id: 'imreal', kind: 'companion', why: 'IMREAL 与本品类相关' },
    { id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMCONJUGATE({n})',
    cases: [
      { label: '默认：3+4i 的共轭', type: 'ok', values: {}, expect: '3-4i', note: '实部不变，虚部取反。' },
      { label: '实数的共轭是它自己', type: 'ok', values: { n: '"5"' }, expect: '5', note: '虚部为 0 时取反还是 0，结果不变。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"3+4k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imconjugateEntry;
