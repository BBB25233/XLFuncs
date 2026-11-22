import type { FunctionEntry } from '@/types';

/** IMAGINARY · 复数虚部（engineering 类 B9 批次） */

const imaginaryEntry: FunctionEntry = {
  id: 'imaginary',
  enName: 'IMAGINARY',
  zhName: '复数虚部',
  zhCommon: ['IMAGINARY', '虚部'],
  alias: ['取虚部'],
  category: 'engineering',
  abbr: 'fsxb',
  pinyin: 'fushuxubu',
  keywords: ['imaginary', '复数', '虚部'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '取复数的虚部',
  summary: 'IMAGINARY 返回复数的虚部系数。',
  syntax: { patternCn: '=IMAGINARY(复数)', patternEn: '=IMAGINARY(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '虚部系数（实数）',
  examples: [{ title: '示例：取虚部', scene: '复数 3+4i', dataAnchor: 'A2', formula: '=IMAGINARY("3+4i")', result: '4', explanation: '虚部为 4。' },
    { title: '示例 2：从容性阻抗里取出容抗', scene: '某支路阻抗写成 12-5j Ω，其中 −5 是容抗（负号代表容性），要单独把这 5Ω 的容抗取出来填进元件表。', dataAnchor: 'A2', formula: '=IMAGINARY("12-5j")', result: '-5（Ω）', explanation: 'IMAGINARY 连符号一起取，返回 −5 而不再是 5。想只要大小得再套一层 ABS；虚部为负是容性、为正才是感性，别只记绝对值。' }],
  pitfalls: [{ title: '纯实数虚部为 0', reason: '虚部缺失视为 0。', fix: '实数复数虚部返回 0。', level: 'low' }],
  related: [{ id: 'imreal', kind: 'companion', why: 'IMREAL 与本品类相关' },
    { id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' },
    { id: 'imconjugate', kind: 'companion', why: 'IMCONJUGATE 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMAGINARY({n})',
    cases: [
      { label: '默认：3+4i 的虚部', type: 'ok', values: {}, expect: '4', note: '虚部系数是 4，返回值是数字（不是文本）。' },
      { label: '虚部为负', type: 'ok', values: { n: '"3-4i"' }, expect: '-4', note: 'IMAGINARY 会把符号一起带出来。' },
      { label: '纯实数 7 的虚部是 0', type: 'ok', values: { n: '"7"' }, expect: '0', note: '没有虚部时返回 0，不是报错。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"3+4k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 FALSE → #VALUE!', type: 'error', values: { n: 'FALSE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imaginaryEntry;
