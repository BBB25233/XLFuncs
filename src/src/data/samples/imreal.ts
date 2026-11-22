import type { FunctionEntry } from '@/types';

/** IMREAL · 复数实部（engineering 类 B9 批次） */

const imrealEntry: FunctionEntry = {
  id: 'imreal',
  enName: 'IMREAL',
  zhName: '复数实部',
  zhCommon: ['IMREAL', '实部'],
  alias: ['取实部'],
  category: 'engineering',
  abbr: 'fssb',
  pinyin: 'fushushibu',
  keywords: ['imreal', '复数', '实部'],
  difficulty: 3,
  usageLevel: 4,
  version: { min: 'all', label: 'Excel 2003 起全版本可用' },
  oneLiner: '取复数的实部',
  summary: 'IMREAL 返回复数的实部系数。',
  syntax: { patternCn: '=IMREAL(复数)', patternEn: '=IMREAL(inumber)', args: [{ key: 'n', zh: '复数', en: 'inumber', required: true, desc: '复数文本' }] },
  returnValue: '实部系数（实数）',
  examples: [{ title: '示例：取实部', scene: '复数 3+4i', dataAnchor: 'A2', formula: '=IMREAL("3+4i")', result: '3', explanation: '实部为 3。' },
    { title: '示例 2：从阻抗里拆出电阻分量', scene: '阻抗表里存的是 12-5j 这样的整体值，做热损耗核算时只用电阻分量，要把它单独拆出来。', dataAnchor: 'A2', formula: '=IMREAL("12-5j")', result: '12（Ω）', explanation: '实部就是电阻 R=12Ω，虚部那部分不消耗有功功率，所以热量只按实部算。纯虚数（如 5j）取出来是 0。' }],
  pitfalls: [{ title: '纯虚数实部为 0', reason: '实部缺失视为 0。', fix: '纯虚数实部返回 0。', level: 'low' }],
  related: [{ id: 'imaginary', kind: 'companion', why: 'IMAGINARY 与本品类相关' },
    { id: 'imabs', kind: 'companion', why: 'IMABS 与本品类相关' },
    { id: 'imconjugate', kind: 'companion', why: 'IMCONJUGATE 与本品类相关' }],
  calc: {
    enabled: true,
    sampleTableId: 'sales',
    ranges: {},
    fields: [
      { key: 'n', label: '复数', type: 'text', default: '"3+4i"', placeholder: '"3+4i"', hint: '复数文本：实部与虚部用 + 或 - 连接，后缀用 i 或 j' },
    ],
    template: '=IMREAL({n})',
    cases: [
      { label: '默认：3+4i 的实部', type: 'ok', values: {}, expect: '3', note: '实部系数是 3，返回值是数字（不是文本）。' },
      { label: '纯虚数 5i 的实部是 0', type: 'ok', values: { n: '"5i"' }, expect: '0', note: '没有实部时返回 0，不是报错。' },
      { label: '后缀写成 k → #NUM!', type: 'error', values: { n: '"3+4k"' }, expect: '#NUM!', note: '虚部后缀只能是 i 或 j。' },
      { label: '完全不是复数 → #NUM!', type: 'error', values: { n: 'abc' }, expect: '#NUM!', note: '解析不成 x+yi / x+yj 的文本一律 #NUM!。' },
      { label: '参数留空 → #NUM!', type: 'error', values: { n: '' }, expect: '#NUM!', note: '空参数解析不出复数。' },
      { label: '填逻辑值 TRUE → #VALUE!', type: 'error', values: { n: 'TRUE' }, expect: '#VALUE!', note: '复数函数一律不接受 TRUE/FALSE。' },
    ],
  },
  meta: { updatedAt: '2026-08-31', status: 'published', customEdited: false },
};

export default imrealEntry;
