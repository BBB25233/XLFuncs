import type { FunctionEntry } from '@/types';

/** IMABS · 复数模长（engineering 类 B9 批次） */

const imabsEntry: FunctionEntry = {
  id: 'imabs',
  enName: 'IMABS',
  zhName: '复数模长',
  zhCommon: ['IMABS', '复数模'],
  alias: ['复数绝对值'],
  category: 'engineering',
  abbr: 'fsmc',
  pinyin: 'fushumochang',
  keywords: ['imabs', '复数', '模'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '算复数的模（绝对值）',
  summary: 'IMABS 返回复数的模 = √(实部²+虚部²)。',
  syntax: { patternCn: '=IMABS(复数)', patternEn: '=IMABS(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本，如 3+4i' }] },
  returnValue: '模长（实数）',
  examples: [{ title: '示例：模长', scene: '复数 3+4i', dataAnchor: 'A2', formula: '=IMABS("3+4i")', result: '5', explanation: '√(3²+4²)=5。' }],
  pitfalls: [{ title: '文本要加引号', reason: '复数常量作参数需引号。', fix: '写 "3+4i" 而非 3+4i。', level: 'mid' }],
  related: [{ id: 'imargument', kind: 'companion', why: 'IMARGUMENT 与本品类相关' },
    { id: 'imreal', kind: 'companion', why: 'IMREAL 与本品类相关' },
    { id: 'imaginary', kind: 'companion', why: 'IMAGINARY 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMABS({n})',
    cases: [
      { label: '默认：3+4i 的模', type: 'ok', values: {}, expect: '5', note: '√(3²+4²)=5，模就是「复数到原点的距离」。' },
      { label: '5-12i 的模', type: 'ok', values: { n: '"5-12i"' }, expect: '13', note: '虚部为负不影响模长，√(5²+12²)=13。' },
      { label: '纯实数 7 的模就是 7', type: 'ok', values: { n: '"7"' }, expect: '7', note: '没有虚部时 IMABS 退化成绝对值。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"3+4k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j，写成 k Excel 认不出这是复数。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imabsEntry;
